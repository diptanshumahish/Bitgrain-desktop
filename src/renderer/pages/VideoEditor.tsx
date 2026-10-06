import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  currentProjectSignal,
  projectLoadingSignal,
  projectErrorSignal,
  setCurrentProject,
  selectedClipIdSignal,
} from "../modules/video/store/project-store";
import { setCurrentTime } from "../modules/video/store/timeline-store";
import { setPlaying } from "../modules/video/store/playback-store";
import { startAutosave } from "../modules/video/store/autosave";
import { getVideoProjectById } from "../modules/video/store/video-projects-store";
import { startHistoryRecorder } from "../modules/video/store/video-history-store";
import { captureAndPersistThumbnail } from "../modules/video/utils/capture-thumbnail";
import { useSignalValue } from "../lib/signal";
import { VideoEditor as VideoEditorView } from "../modules/video/components/VideoEditor";
import { trackEvent } from "../lib/tracker";
import { useIsMobile } from "../hooks/useIsMobile";
import { MobileBlock } from "../components/studio/MobileBlock";

const VideoEditor: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  useEffect(() => {
    let cancelled = false;
    if (!projectId) {
      navigate("/video", { replace: true });
      return;
    }

    projectLoadingSignal.value = true;
    projectErrorSignal.value = null;
    selectedClipIdSignal.value = null;
    setCurrentTime(0);
    setPlaying(false);

    const stopAutosave = startAutosave();
    let stopHistory: (() => void) | null = null;

    getVideoProjectById(projectId)
      .then((project) => {
        if (cancelled) return;
        if (!project) {
          projectErrorSignal.value = "Project not found";
          setCurrentProject(null);
        } else {
          setCurrentProject(project);
          trackEvent("video", "project_loaded", { details: { id: project.id, name: project.name } });
          stopHistory = startHistoryRecorder();
        }
      })
      .catch(() => {
        if (cancelled) return;
        projectErrorSignal.value = "Could not load project";
      })
      .finally(() => {
        if (cancelled) return;
        projectLoadingSignal.value = false;
      });

    return () => {
      cancelled = true;
      captureAndPersistThumbnail();
      stopAutosave();
      if (stopHistory) stopHistory();
      setCurrentProject(null);
      setPlaying(false);
    };
  }, [projectId, navigate]);

  const project = useSignalValue(currentProjectSignal);

  useEffect(() => {
    const updateTitle = () => {
      const name = project?.name || "Video Editor";
      document.title = `${name}, Bitgrain`;
    };
    updateTitle();
    // Force it again after a small delay to win against any other libraries
    const timer = setTimeout(updateTitle, 50);
    return () => clearTimeout(timer);
  }, [project]);

  if (isMobile) {
    return (
      <MobileBlock
        onBack={() => navigate("/hello")}
        title="video needs a bigger screen"
        body="the timeline and previews don't fit comfortably on a phone. the image editor works on your phone though, drop a photo and go."
      />
    );
  }

  return <VideoEditorView />;
};

export default VideoEditor;
