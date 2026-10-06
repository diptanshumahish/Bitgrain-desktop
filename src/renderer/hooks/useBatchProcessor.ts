import { useState, useCallback, useRef, useEffect } from 'react';
import { zipSync } from 'fflate';
import {
  renderBatchLook,
  canvasToPngBlob,
  canvasToSvgString,
} from '../engine/BatchRenderer';
import type { TransformSnapshot } from '../store/transform-store';

export type BatchExportFormat = 'png' | 'svg';

export type BatchItemStatus = 'pending' | 'processing' | 'done' | 'error';

export interface BatchItem {
  id: string;
  file: File;
  previewUrl: string;
  status: BatchItemStatus;
  errorMsg?: string;
}

interface UseBatchProcessorOptions {
  snapshot: TransformSnapshot;
  format: BatchExportFormat;
  onNeedCredits: () => void;
  consumeCredits: (count: number, format: BatchExportFormat) => boolean;
}

export function useBatchProcessor({
  snapshot,
  format,
  onNeedCredits,
  consumeCredits,
}: UseBatchProcessorOptions) {
  const [items, setItems] = useState<BatchItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [doneCount, setDoneCount] = useState(0);
  const cancelRef = useRef(false);
  const resultBlobsRef = useRef<Map<string, Blob | string>>(new Map());

  const snapshotRef = useRef(snapshot);
  useEffect(() => { snapshotRef.current = snapshot; }, [snapshot]);

  const addFiles = useCallback((files: File[]) => {
    const newItems: BatchItem[] = files
      .filter((f) => f.type.startsWith('image/') || /\.(heic|heif)$/i.test(f.name))
      .map((file) => ({
        id: `${file.name}-${Math.random().toString(36).slice(2)}`,
        file,
        previewUrl: URL.createObjectURL(file),
        status: 'pending' as BatchItemStatus,
      }));
    setItems((prev) => [...prev, ...newItems].slice(0, 50));
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => {
      const item = prev.find((i) => i.id === id);
      if (item) URL.revokeObjectURL(item.previewUrl);
      return prev.filter((i) => i.id !== id);
    });
    resultBlobsRef.current.delete(id);
  }, []);

  const clearAll = useCallback(() => {
    setItems((prev) => {
      prev.forEach((i) => URL.revokeObjectURL(i.previewUrl));
      return [];
    });
    resultBlobsRef.current.clear();
    setDoneCount(0);
    cancelRef.current = false;
  }, []);

  // Reset pending items to pending when params change (so they can be re-processed)
  const resetToPending = useCallback(() => {
    resultBlobsRef.current.clear();
    setDoneCount(0);
    setItems((prev) =>
      prev.map((item) => ({ ...item, status: 'pending' as BatchItemStatus, errorMsg: undefined })),
    );
  }, []);

  const processAll = useCallback(async () => {
    const currentItems = await new Promise<BatchItem[]>((resolve) => {
      setItems((prev) => { resolve(prev); return prev; });
    });
    const pending = currentItems.filter((i) => i.status === 'pending');
    if (pending.length === 0) return;

    if (!consumeCredits(pending.length, format)) {
      onNeedCredits();
      return;
    }

    cancelRef.current = false;
    setIsProcessing(true);
    setDoneCount(0);

    const activeSnapshot = snapshotRef.current;

    const updateStatus = (id: string, status: BatchItemStatus, errorMsg?: string) => {
      setItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status, errorMsg } : item)),
      );
    };

    let completed = 0;
    for (const item of pending) {
      if (cancelRef.current) break;

      updateStatus(item.id, 'processing');
      try {
        const canvas = await renderBatchLook(item.file, activeSnapshot, format);

        if (format === 'png') {
          const blob = await canvasToPngBlob(canvas);
          resultBlobsRef.current.set(item.id, blob);
        } else {
          const svg = canvasToSvgString(canvas);
          resultBlobsRef.current.set(item.id, svg);
        }

        updateStatus(item.id, 'done');
        completed++;
        setDoneCount(completed);
      } catch (e) {
        updateStatus(item.id, 'error', e instanceof Error ? e.message : 'Unknown error');
      }
    }

    setIsProcessing(false);
  }, [format, consumeCredits, onNeedCredits]);

  const cancel = useCallback(() => { cancelRef.current = true; }, []);

  const downloadZip = useCallback(async () => {
    const doneItems = items.filter((i) => i.status === 'done');
    if (doneItems.length === 0) return;

    const files: Record<string, Uint8Array> = {};
    for (const item of doneItems) {
      const result = resultBlobsRef.current.get(item.id);
      if (!result) continue;
      const baseName = item.file.name.replace(/\.[^.]+$/, '');
      const ext = format === 'png' ? 'png' : 'svg';
      const filename = `${baseName}_bitgrain.${ext}`;
      if (typeof result === 'string') {
        files[filename] = new TextEncoder().encode(result);
      } else {
        files[filename] = new Uint8Array(await result.arrayBuffer());
      }
    }

    const zipped = zipSync(files, { level: 0 });
    const blob = new Blob([zipped.buffer.slice(0) as ArrayBuffer], { type: 'application/zip' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bitgrain_batch_${Date.now()}.zip`;
    a.click();
    URL.revokeObjectURL(url);
  }, [items, format]);

  const pendingCount = items.filter((i) => i.status === 'pending').length;
  const totalCount = items.length;
  const allDone = totalCount > 0 && items.every((i) => i.status === 'done' || i.status === 'error');

  return {
    items,
    isProcessing,
    doneCount,
    pendingCount,
    totalCount,
    allDone,
    addFiles,
    removeItem,
    clearAll,
    resetToPending,
    processAll,
    cancel,
    downloadZip,
  };
}
