export class Music {
    constructor(id, name, album, cover_path, music_path, artist, artist_bin, time, albumName, isExport, base_url) {
        this.id = id
        this.name = name
        this.album = album
        this.cover_path = cover_path
        this.music_path = music_path
        this.artist = artist
        this.artist_bin = artist_bin
        this.time = time
        this.albumName = albumName
        this.isExport = isExport
        this.base_url = base_url
    }
}