// ============================================================
//  StreamAlerts — WriteViewers.cs
//  Écrit le nombre de spectateurs dans viewers.json.
//
//  Configurer dans Streamer.bot :
//    1. Créer une action "Viewers"
//    2. Ajouter une sous-action "Timer" (toutes les 30 secondes)
//    3. Sous-action "Execute C# Code" → coller ce script
//
//  Variable Streamer.bot utilisée :
//    %viewers%  —  nombre de spectateurs en direct
//    (disponible via l'action "Get Channel Info" ou par variable globale)
//
//  Alternative : déclencher sur l'événement "Stream Update" (Twitch)
//  et lire %viewers% injecté automatiquement par Streamer.bot.
// ============================================================

using System;
using System.IO;

public class CPHInline
{
    const string FILE_PATH =
        @"D:\audri\Xamp\htdocs\StreamAlerts\overlay\data\viewers.json";

    public bool Execute()
    {
        int count = Int("viewers"); // %viewers% injecté par Streamer.bot
        long ts   = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();

        string json =
            "{\n" +
            $"  \"count\": {count},\n" +
            $"  \"timestamp\": {ts}\n" +
            "}";

        File.WriteAllText(FILE_PATH, json, System.Text.Encoding.UTF8);
        return true;
    }

    private int Int(string key)
    {
        if (!args.ContainsKey(key) || args[key] == null) return 0;
        int.TryParse(args[key].ToString(), out int val);
        return val;
    }
}
