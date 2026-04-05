// ============================================================
//  StreamAlerts — WriteLastRaid.cs
//  Script Streamer.bot (Execute C# Code)
//
//  TRIGGER : événement Raid reçu (Twitch → Raid)
//
//  UTILISATION :
//  1. Dans Streamer.bot, créer une action sur l'événement "Raid"
//  2. Ajouter une sous-action : Execute C# Code → coller ce script
//
//  Chemin du fichier écrit :
//    BASE_PATH\overlay\data\last_raid.json
// ============================================================

using System;
using System.IO;
using System.Text.Json;

public class CPHInline
{
    // Modifier ce chemin si StreamAlerts est installé ailleurs
    const string BASE_PATH = @"D:\audri\Xamp\htdocs\StreamAlerts";
    const string FILE_PATH  = BASE_PATH + @"\overlay\data\last_raid.json";

    public bool Execute()
    {
        // ── Variables Streamer.bot pour un Raid ──────────────────
        // %raiderDisplayName% ou %user% selon la version
        string user    = Arg("raiderDisplayName", Arg("user", "Inconnu"));
        string avatar  = Arg("userProfileImageUrl", "");
        int    viewers = Int("raiders"); // nombre de raiders

        long ts = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();

        // JsonSerializer gère tous les caractères de contrôle (tab, BEL, etc.)
        var payload = new {
            user      = user,
            viewers   = viewers,
            avatar    = avatar,
            timestamp = ts,
        };
        string json = JsonSerializer.Serialize(payload,
            new JsonSerializerOptions { WriteIndented = true });

        WriteFile(FILE_PATH, json);
        return true;
    }

    // ── Helpers ───────────────────────────────────────────────

    string Arg(string key, string fallback = "") {
        try {
            var v = CPH.GetGlobalVar<string>(key);
            if (v != null) return v;
        } catch {}
        try {
            object o;
            if (CPH.TryGetArg(key, out o) && o != null) return o.ToString();
        } catch {}
        return fallback;
    }

    int Int(string key) {
        string v = Arg(key, "0");
        return int.TryParse(v, out int r) ? r : 0;
    }

    void WriteFile(string path, string content) {
        string dir = Path.GetDirectoryName(path);
        if (!Directory.Exists(dir)) Directory.CreateDirectory(dir);
        File.WriteAllText(path, content, System.Text.Encoding.UTF8);
    }
}
