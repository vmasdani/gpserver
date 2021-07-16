export const matchExtension = (fileName: string) => {
  if (fileName.match(/\.(mp4|mov|webm|3gp|mkv)/)) {
    return "movie";
  } else if (fileName.match(/\.(jpg|jpeg|png)/)) {
    return "image";
  } else if (fileName.match(/\.(gif)/)) {
    return "gif";
  } else {
    return "others";
  }
};
