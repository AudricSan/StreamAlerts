// ============================================================
//  StreamAlerts — WriteHeartbeat.cs
//  Écrit un fichier heartbeat.json pour confirmer que la chaîne
//  Streamer.bot → disque est opérationnelle.
//
//  Configurer dans Streamer.bot :
//    1. Créer une action "Heartbeat"
//    2. Ajouter un déclencheur "Timer" (intervalle recommandé : 30 secondes)
//    3. Sous-action "Execute C# Code" → coller ce script
//
//  Fichier produit : overlay/data/heartbeat.json
//    {
//      "timestamp": 1710000000000,
//      "status": "ok"
//    }
//
//  AVERTISSEMENT : si plusieurs instances de Streamer.bot tournent
//  simultanément (ex. plusieurs profils actifs), un seul writer doit
//  être actif. Des écritures concurrentes peuvent corrompre le fichier.
// ============================================================

using System;
using System.IO;
using System.Text.Json;

public class CPHInline
{
    // Modifier ce chemin si StreamAlerts est installé ailleurs
    const string BASE_PATH = @"D:\audri\Xamp\htdocs\StreamAlerts";

    const string FILE_PATH = BASE_PATH + @"\overlay\data\heartbeat.json";

    public bool Execute()
    {
        long ts = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();

        var payload = new
        {
            timestamp = ts,
            status    = "ok"
        };

        string json = JsonSerializer.Serialize(payload, new JsonSerializerOptions
        {
            WriteIndented = true
        });

        File.WriteAllText(FILE_PATH, json, System.Text.Encoding.UTF8);
        return true;
    }
}
