import Storage from '../commons/remote/storage';

export function removeFilesFor(element) {
  let uris = [];
  uris.push(element.source_url);
  uris.push(element.thumbnail_url);

  for (let audio of element.audios || []) {
    uris.push(audio.source_url);
  }

  console.info('Deleting ' + uris.length + ' files');
  return Storage.batchRemoveFiles(uris);
}
