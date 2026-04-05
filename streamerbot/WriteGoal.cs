// ============================================================
//  StreamAlerts — WriteGoal.cs
//  Script Streamer.bot (Execute C# Code)
//
//  Incrémente le compteur de l'objectif et écrit goal.json.
//
//  UTILISATION — ajouter dans chaque action concernée :
//    1. Set Argument  →  goalIncrement  =  1        (ou autre valeur)
//    2. Set Argument  →  goalTarget     =  100       (optionnel, sinon valeur du fichier)
//    3. Set Argument  →  goalLabel      =  "Objectif subs"  (optionnel)
//    4. Set Argument  →  goalType       =  sub       (sub|follow|bits|donation|custom)
//    5. Execute C# Code  →  colle ce script
//
//  Pour RÉINITIALISER : Set Argument goalReset = true
// ============================================================

using System;
using System.IO;
using System.Text.RegularExpressions;

public class CPHInline
{
    // Modifier ce chemin si StreamAlerts est installé ailleurs
    const string BASE_PATH = @"D:\audri\Xamp\htdocs\StreamAlerts";

    const string FILE_PATH = BASE_PATH + @"\overlay\data\goal.json";

    public bool Execute()
    {
        bool reset = Arg("goalReset") == "true";

        // ── Lire le fichier existant pour conserver label/target ─
        int    current = 0;
        int    target  = Int("goalTarget",  100);
        string label   = Arg("goalLabel",  "Objectif subs");
        string type    = Arg("goalType",   "sub");

        if (!reset && File.Exists(FILE_PATH))
        {
            try
            {
                string content = File.ReadAllText(FILE_PATH, System.Text.Encoding.UTF8);

                var mCurrent = Regex.Match(content, @"""current""\s*:\s*(\d+)");
                if (mCurrent.Success) int.TryParse(mCurrent.Groups[1].Value, out current);

                // Conserver target/label/type si non fournis
                var mTarget = Regex.Match(content, @"""target""\s*:\s*(\d+)");
                if (mTarget.Success && !args.ContainsKey("goalTarget"))
                    int.TryParse(mTarget.Groups[1].Value, out target);

                var mLabel = Regex.Match(content, @"""label""\s*:\s*""([^""]+)""");
                if (mLabel.Success && !args.ContainsKey("goalLabel"))
                    label = mLabel.Groups[1].Value;

                var mType = Regex.Match(content, @"""type""\s*:\s*""([^""]+)""");
                if (mType.Success && !args.ContainsKey("goalType"))
                    type = mType.Groups[1].Value;
            }
            catch { }
        }

        if (reset)
            current = 0;
        else
            current += Int("goalIncrement", 1);

        long ts = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();

        string json =
            "{\n" +
            $"  \"label\": \"{J(label)}\",\n" +
            $"  \"current\": {current},\n" +
            $"  \"target\": {target},\n" +
            $"  \"type\": \"{J(type)}\",\n" +
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
        return val == 0 && fallback != 0 ? fallback : val;
    }

    private string J(string s)
    {
        if (string.IsNullOrEmpty(s)) return "";
        return s.Replace("\\", "\\\\").Replace("\"", "\\\"")
                .Replace("\n", "\\n").Replace("\r", "\\r").Replace("\t", "\\t");
    }
}
