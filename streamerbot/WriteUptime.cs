// ============================================================
//  StreamAlerts — WriteUptime.cs
//  Enregistre l'heure de début du stream dans uptime.json.
//  L'overlay calcule ensuite l'uptime de façon autonome.
//
//  Configurer dans Streamer.bot :
//    1. Créer une action "Uptime Start"
//    2. Déclencher sur l'événement : Twitch → Stream Online
//    3. Sous-action "Execute C# Code" → coller ce script
//
//  Pour réinitialiser (fin de stream) :
//    Déclencher sur Stream Offline → remettre startedAt à 0.
// ============================================================

using System;
using System.IO;

public class CPHInline
{
    // Modifier ce chemin si StreamAlerts est installé ailleurs
    const string BASE_PATH = @"D:\audri\Xamp\htdocs\StreamAlerts";

    const string FILE_PATH = BASE_PATH + @"\overlay\data\uptime.json";

    public bool Execute()
    {
        // "reset" = true → remet à zéro (fin de stream)
        bool reset = Arg("reset", "false").ToLower() == "true";

        long startedAt = reset ? 0 : DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
        long ts        = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();

        string json =
            "{\n" +
            $"  \"startedAt\": {startedAt},\n" +
            $"  \"timestamp\": {ts}\n" +
            "}";

        File.WriteAllText(FILE_PATH, json, System.Text.Encoding.UTF8);
        return true;
    }

    private string Arg(string key, string fallback = "")
        => args.ContainsKey(key) && args[key] != null
            ? args[key].ToString().Trim()
            : fallback;
}
