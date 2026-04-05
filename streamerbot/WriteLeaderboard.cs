// ============================================================
//  StreamAlerts — WriteLeaderboard.cs
//  Gère le classement des top contributeurs (bits, dons…).
//  Accumule les scores dans leaderboard.json.
//
//  Configurer dans Streamer.bot :
//    Réutiliser la même action que WriteAlert.cs.
//    Ajouter une sous-action "Set Argument" :
//      leaderType = bits    (ou "donation")
//    Déclencher sur :
//      ⚡ Cheer/Bits  (pour les bits)
//      ⚡ Donation    (pour les dons StreamElements/StreamLabs)
//
//  Commande de reset (mods uniquement) :
//    !leaderboard reset   — remet à zéro le classement
//
//  Pour afficher un classement différent, changer leaderType et title.
// ============================================================

using System;
using System.IO;
using System.Collections.Generic;
using System.Linq;
using Newtonsoft.Json.Linq;

public class CPHInline
{
    // Modifier ce chemin si StreamAlerts est installé ailleurs
    const string BASE_PATH = @"D:\audri\Xamp\htdocs\StreamAlerts";

    const string FILE_PATH = BASE_PATH + @"\overlay\data\leaderboard.json";

    const int MAX_ENTRIES = 10; // garder plus que l'affichage pour les remontées

    public bool Execute()
    {
        string leaderType = Arg("leaderType", "bits");
        string raw        = Arg("rawInput");

        // Reset via commande chat (mods/broadcaster)
        if (raw.StartsWith("!leaderboard reset", StringComparison.OrdinalIgnoreCase))
        {
            bool isMod  = args.ContainsKey("isModerator")   && Convert.ToBoolean(args["isModerator"]);
            bool isBroa = args.ContainsKey("isBroadcaster") && Convert.ToBoolean(args["isBroadcaster"]);
            if (isMod || isBroa)
            {
                WriteJson("Top " + Cap(leaderType), new List<Entry>());
                return true;
            }
            return true;
        }

        string user   = Arg("user");
        int    amount = Int(leaderType == "bits" ? "bits" : "amount");
        if (string.IsNullOrEmpty(user) || amount <= 0) return true;

        // Chargement du classement existant
        List<Entry> entries = LoadEntries();

        var existing = entries.FirstOrDefault(e =>
            string.Equals(e.User, user, StringComparison.OrdinalIgnoreCase));

        if (existing != null)
            existing.Score += amount;
        else
            entries.Add(new Entry { User = user, Score = amount });

        // Tri décroissant + limite
        entries = entries.OrderByDescending(e => e.Score).Take(MAX_ENTRIES).ToList();

        WriteJson("Top " + Cap(leaderType), entries);
        return true;
    }

    // ── Helpers ───────────────────────────────────────────────────

    private List<Entry> LoadEntries()
    {
        try
        {
            if (!File.Exists(FILE_PATH)) return new List<Entry>();
            var obj  = JObject.Parse(File.ReadAllText(FILE_PATH));
            var arr  = obj["entries"] as JArray;
            if (arr == null) return new List<Entry>();
            return arr.Select(e => new Entry {
                User  = e["user"]?.Value<string>() ?? "",
                Score = e["score"]?.Value<int>()   ?? 0,
            }).ToList();
        }
        catch { return new List<Entry>(); }
    }

    private void WriteJson(string title, List<Entry> entries)
    {
        long ts   = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
        var  rows = entries.Select(e => $"    {{\"user\":\"{J(e.User)}\",\"score\":{e.Score}}}");
        string json =
            "{\n" +
            $"  \"title\": \"{J(title)}\",\n" +
            $"  \"entries\": [\n{string.Join(",\n", rows)}\n  ],\n" +
            $"  \"timestamp\": {ts}\n" +
            "}";
        File.WriteAllText(FILE_PATH, json, System.Text.Encoding.UTF8);
    }

    private string Arg(string key, string fallback = "")
        => args.ContainsKey(key) && args[key] != null
            ? args[key].ToString().Trim()
            : fallback;

    private int Int(string key)
    {
        if (!args.ContainsKey(key) || args[key] == null) return 0;
        int.TryParse(args[key].ToString(), out int val);
        return val;
    }

    private string Cap(string s) =>
        string.IsNullOrEmpty(s) ? s : char.ToUpper(s[0]) + s.Substring(1);

    private string J(string s)
    {
        if (string.IsNullOrEmpty(s)) return "";
        return s.Replace("\\", "\\\\").Replace("\"", "\\\"")
                .Replace("\n", "\\n").Replace("\r", "\\r");
    }

    private class Entry { public string User; public int Score; }
}
