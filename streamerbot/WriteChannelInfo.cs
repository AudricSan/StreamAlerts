// ============================================================
//  StreamAlerts — WriteChannelInfo.cs
//  Script Streamer.bot (Execute C# Code)
//
//  TRIGGERS recommandés (selon la version de Streamer.bot) :
//    - "Twitch Stream Update"  (titre / jeu modifié)
//    - "Channel Info Update"   (si disponible)
//    - Ou action manuelle / timer pour rafraîchissement périodique
//
//  UTILISATION :
//  1. Dans Streamer.bot, créer une action sur le trigger "Stream Update"
//  2. Ajouter une sous-action : Execute C# Code → coller ce script
//
//  Variables Streamer.bot utilisées :
//    streamTitle   — titre du stream
//    gameName      — nom du jeu / catégorie
//    broadcastLanguage — langue (optionnel)
// ============================================================

using System;
using System.IO;
using System.Text.Json;

public class CPHInline
{
    // Modifier ce chemin si StreamAlerts est installé ailleurs
    const string BASE_PATH = @"D:\audri\Xamp\htdocs\StreamAlerts";
    const string FILE_PATH  = BASE_PATH + @"\overlay\data\channel_info.json";

    public bool Execute()
    {
        // ── Variables Streamer.bot ────────────────────────────────
        // Les noms de variables peuvent varier selon la version ; adapter si besoin
        string title    = Arg("streamTitle",        Arg("title",    ""));
        string category = Arg("gameName",           Arg("game",     ""));
        string language = Arg("broadcastLanguage",  Arg("language", ""));

        long ts = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();

        // JsonSerializer gère tous les caractères de contrôle (tab, BEL, etc.)
        var payload = new {
            title     = title,
            category  = category,
            language  = language,
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

    void WriteFile(string path, string content) {
        string dir = Path.GetDirectoryName(path);
        if (!Directory.Exists(dir)) Directory.CreateDirectory(dir);
        File.WriteAllText(path, content, System.Text.Encoding.UTF8);
    }
}
