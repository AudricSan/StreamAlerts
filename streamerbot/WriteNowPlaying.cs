// ============================================================
//  StreamAlerts — WriteNowPlaying.cs
//  Script Streamer.bot (Execute C# Code)
//
//  Écrit le titre/artiste en cours de lecture.
//  Peut être déclenché par un timer Streamer.bot, une commande
//  chat (!np), ou une intégration media (Spotify desktop, etc.)
//
//  UTILISATION :
//    1. Set Argument  →  npTitle   = %title%     (titre du son)
//    2. Set Argument  →  npArtist  = %artist%    (artiste, optionnel)
//    3. Set Argument  →  npActive  = true        (false pour masquer)
//    4. Execute C# Code  →  colle ce script
//
//  Pour MASQUER : Set Argument npActive = false
// ============================================================

using System;
using System.IO;

public class CPHInline
{
    // Modifier ce chemin si StreamAlerts est installé ailleurs
    const string BASE_PATH = @"D:\audri\Xamp\htdocs\StreamAlerts";

    const string FILE_PATH = BASE_PATH + @"\overlay\data\nowplaying.json";

    public bool Execute()
    {
        string title  = Arg("npTitle");
        string artist = Arg("npArtist");
        bool   active = Arg("npActive", "true").ToLower() != "false" && title != "";
        long   ts     = DateTimeOffset.UtcNow.ToUnixTimeSeconds();

        string json =
            "{\n" +
            $"  \"title\": \"{J(title)}\",\n" +
            $"  \"artist\": \"{J(artist)}\",\n" +
            $"  \"active\": {(active ? "true" : "false")},\n" +
            $"  \"timestamp\": {ts}\n" +
            "}";

        File.WriteAllText(FILE_PATH, json, System.Text.Encoding.UTF8);
        return true;
    }

    // ── Helpers ───────────────────────────────────────────────────

    private string Arg(string key, string fallback = "")
        => args.ContainsKey(key) && args[key] != null
            ? args[key].ToString().Trim()
            : fallback;

    private string J(string s)
    {
        if (string.IsNullOrEmpty(s)) return "";
        return s.Replace("\\", "\\\\").Replace("\"", "\\\"")
                .Replace("\n", "\\n").Replace("\r", "\\r").Replace("\t", "\\t");
    }
}
