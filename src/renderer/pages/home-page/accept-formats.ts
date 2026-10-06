const STANDARD_MIME =
  "image/jpeg,image/png,image/webp,image/gif,image/bmp,image/avif," +
  "image/heic,image/heif,image/tiff,image/x-adobe-dng," +
  "image/x-canon-cr2,image/x-canon-cr3,image/x-canon-crw," +
  "image/x-nikon-nef,image/x-nikon-nrw,image/x-sony-arw," +
  "image/x-sony-sr2,image/x-sony-srf,image/x-fuji-raf," +
  "image/x-panasonic-rw2,image/x-olympus-orf,image/x-pentax-pef," +
  "image/x-samsung-srw,image/x-sigma-x3f,image/x-hasselblad-3fr," +
  "image/x-minolta-mrw,image/x-mamiya-mef,image/x-kodak-kdc," +
  "image/x-kodak-dcr,image/x-epson-erf,image/x-leica-rwl";

const STANDARD_EXT =
  ".jpg,.jpeg,.png,.webp,.gif,.bmp,.avif,.svg,.ico," +
  ".heic,.heif,.tif,.tiff," +
  ".dng,.cr2,.cr3,.crw,.nef,.nrw,.arw,.srf,.sr2," +
  ".raf,.rw2,.orf,.pef,.ptx,.srw,.x3f,.raw,.3fr," +
  ".mrw,.mef,.mos,.kdc,.dcr,.erf,.rwl,.iiq,.fff";

export const IMAGE_ACCEPT = `${STANDARD_MIME},${STANDARD_EXT}`;
