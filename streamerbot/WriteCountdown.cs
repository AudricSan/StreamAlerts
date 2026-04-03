// ============================================================
//  StreamAlerts — WriteCountdown.cs
//  Démarre / arrête un compte à rebours depuis le chat.
//
//  Commandes (modérateur ou broadcaster uniquement) :
//    !countdown <minutes> [label]   — démarre un timer
//    !countdown stop                — arrête le timer
//
//  Exemples :
//    !countdown 10                  → 10 minutes, label par défaut
//    !countdown 5 Pause             → 5 minutes, label "Pause"
//    !countdown 0:30                → 30 secondes
//    !countdown stop                → masque le widget
//
//  Configurer dans Streamer.bot :
//    1. Créer une action "Countdown"
//    2. Créer une commande chat "!countdown"
//       → déclenche cette action
//    3. Cocher Moderator + Broadcaster dans les permissions
//    4. Sous-action "Execute C# Code" → coller ce script
// ============================================================

using System;
using System.IO;
using System.Text.RegularExpressions;

public class CPHInline
{
    const string FILE_PATH =
        @"D:\audri\Xamp\htdocs\StreamAlerts\overlay\data\countdown.json";

    public bool Execute()
    {
        bool isMod  = args.ContainsKey("isModerator")   && Convert.ToBoolean(args["isModerator"]);
        bool isBroa = args.ContainsKey("isBroadcaster") && Convert.ToBoolean(args["isBroadcaster"]);
        if (!isMod && !isBroa) return true;

        string raw = Arg("rawInput").Trim();

        // !countdown stop
        if (Regex.IsMatch(raw, @"!countdown\s+stop", RegexOptions.IgnoreCase))
        {
            WriteJson(false, "", 0, 0);
            return true;
        }

        // !countdown <durée> [label]
        var m = Regex.Match(raw, @"!countdown\s+(\d+(?::\d+)?)\s*(.*)", RegexOptions.IgnoreCase);
        if (!m.Success) return true;

        string label    = m.Groups[2].Value.Trim();
        string dureePart = m.Groups[1].Value;

        long totalSeconds;
        if (dureePart.Contains(":"))
        {
            // format mm:ss
            var parts = dureePart.Split(':');
            totalSeconds = long.Parse(parts[0]) * 60 + long.Parse(parts[1]);
        }
        else
        {
            totalSeconds = long.Parse(dureePart) * 60;
        }

        if (totalSeconds <= 0) { WriteJson(false, "", 0, 0); return true; }

        long now       = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
        long endsAt    = now + totalSeconds * 1000;

        WriteJson(true, label, now, endsAt);
        return true;
    }

    private void WriteJson(bool active, string label, long startedAt, long endsAt)
    {
        long ts = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
        string json =
            "{\n" +
            $"  \"label\": \"{J(label)}\",\n" +
            $"  \"active\": {(active ? "true" : "false")},\n" +
            $"  \"startedAt\": {startedAt},\n" +
            $"  \"endsAt\": {endsAt},\n" +
            $"  \"timestamp\": {ts}\n" +
            "}";
        File.WriteAllText(FILE_PATH, json, System.Text.Encoding.UTF8);
    }

    private string Arg(string key, string fallback = "")
        => args.ContainsKey(key) && args[key] != null
            ? args[key].ToString().Trim()
            : fallback;

    private string J(string s)
    {
        if (string.IsNullOrEmpty(s)) return "";
        return s.Replace("\\", "\\\\").Replace("\"", "\\\"")
                .Replace("\n", "\\n").Replace("\r", "\\r");
    }
}
