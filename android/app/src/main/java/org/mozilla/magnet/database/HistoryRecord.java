package org.mozilla.magnet.database;

public class HistoryRecord {
    public int id;
    public String url;
    public long lastSeen;
    public long firstSeen;

    HistoryRecord(int id, String url, long lastSeen, long firstSeen) {
        this.id = id;
        this.url = url;
        this.lastSeen = lastSeen;
        this.firstSeen = firstSeen;
    }
}
