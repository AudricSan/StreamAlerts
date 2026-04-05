// ============================================================
//  StreamAlerts — WriteSubTrain.cs
//  Script Streamer.bot (Execute C# Code)
//
//  Met à jour le sub train à chaque sub/resub/giftsub.
//  À appeler dans les mêmes actions que WriteAlert.cs.
//
//  UTILISATION :
//    1. Set Argument  →  user             = %user%
//    2. Set Argument  →  trainDuration    = 60     (secondes, optionnel)
//    3. Execute C# Code  →  colle ce script
// ============================================================

using System;
using System.IO;
using System.Text.RegularExpressions;

public class CPHInline
{
    // Modifier ce chemin si StreamAlerts est installé ailleurs
    const string BASE_PATH = @"D:\audri\Xamp\htdocs\StreamAlerts";

    const string FILE_PATH = BASE_PATH + @"\overlay\data\subtrain.json";

    public bool Execute()
    {
        string user     = Arg("user");
        int    duration = Int("trainDuration", 60); // secondes

        // ── Lire le compte actuel ─────────────────────────────────
        int count = 0;
        if (File.Exists(FILE_PATH))
        {
            try
            {
                string content = File.ReadAllText(FILE_PATH, System.Text.Encoding.UTF8);
                var m = Regex.Match(content, @"""count""\s*:\s*(\d+)");
                if (m.Success) int.TryParse(m.Groups[1].Value, out count);
            }
            catch { }
        }

        count++;
        long now       = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
        long expiresAt = now + (duration * 1000L);
        long ts        = DateTimeOffset.UtcNow.ToUnixTimeSeconds();

        string json =
            "{\n" +
            $"  \"count\": {count},\n" +
            $"  \"active\": true,\n" +
            $"  \"lastUser\": \"{J(user)}\",\n" +
            $"  \"expiresAt\": {expiresAt},\n" +
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

    private int Int(string key, int fallback = 0)
    {
        if (!args.ContainsKey(key) || args[key] == null) return fallback;
        int.TryParse(args[key].ToString(), out int val);
        return val > 0 ? val : fallback;
    }

    private string J(string s)
    {
        if (string.IsNullOrEmpty(s)) return "";
        return s.Replace("\\", "\\\\").Replace("\"", "\\\"")
                .Replace("\n", "\\n").Replace("\r", "\\r").Replace("\t", "\\t");
    }
}
