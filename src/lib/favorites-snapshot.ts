export function shouldCommitFavoritesSnapshot(startedGeneration: number, currentGeneration: number) {
  return startedGeneration === currentGeneration
}
