// ============================================================
//  StreamAlerts — WritePoll.cs
//  Affiche le sondage Twitch actif dans l'overlay.
//
//  Configurer dans Streamer.bot :
//    1. Créer une action "Poll"
//    2. Déclencher sur les événements Twitch :
//       ⚡ Poll Created    → écrit le sondage (active: true)
//       ⚡ Poll Updated    → met à jour les votes
//       ⚡ Poll Completed  → clôture le sondage (active: false)
//    3. Sous-action "Execute C# Code" → coller ce script
//
//  Arguments Streamer.bot (injectés automatiquement) :
//    %pollTitle%          — titre du sondage
//    %pollChoice0Title%   — titre du choix 0
//    %pollChoice0Votes%   — votes du choix 0
//    %pollChoice1Title%   — titre du choix 1
//    %pollChoice1Votes%   — votes du choix 1
//    (jusqu'à 5 choix : pollChoice0 … pollChoice4)
//    %pollDurationSeconds% — durée totale en secondes
//    %pollStatus%          — "created" | "active" | "completed"
//
//  Note : les noms exacts des variables peuvent varier selon la version
//  de Streamer.bot. Vérifier dans l'onglet "Variables" d'une action test.
// ============================================================

using System;
using System.IO;
using System.Collections.Generic;

public class CPHInline
{
    const string FILE_PATH =
        @"D:\audri\Xamp\htdocs\StreamAlerts\overlay\data\poll.json";

    public bool Execute()
    {
        string title  = Arg("pollTitle");
        string status = Arg("pollStatus", "active").ToLower();
        bool active   = status != "completed" && status != "terminated";

        long now      = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
        long duration = Int("pollDurationSeconds") * 1000L;
        long startedAt= now - (duration > 0 ? duration : 0);
        long endsAt   = active && duration > 0 ? startedAt + duration : 0;

        // Lecture des choix (Streamer.bot injecte jusqu'à 5 choix)
        var choices = new List<(string Title, int Votes)>();
        for (int i = 0; i < 5; i++)
        {
            string t = Arg($"pollChoice{i}Title");
            if (string.IsNullOrEmpty(t)) break;
            int v = Int($"pollChoice{i}Votes");
            choices.Add((t, v));
        }

        // Construction du JSON
        long ts = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
        var rows = choices.Select(c =>
            $"    {{\"title\":\"{J(c.Title)}\",\"votes\":{c.Votes}}}");

        string json =
            "{\n" +
            $"  \"title\": \"{J(title)}\",\n" +
            $"  \"active\": {(active ? "true" : "false")},\n" +
            $"  \"startedAt\": {startedAt},\n" +
            $"  \"endsAt\": {endsAt},\n" +
            $"  \"choices\": [\n{string.Join(",\n", rows)}\n  ],\n" +
            $"  \"timestamp\": {ts}\n" +
            "}";

        File.WriteAllText(FILE_PATH, json, System.Text.Encoding.UTF8);
        return true;
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

    private string J(string s)
    {
        if (string.IsNullOrEmpty(s)) return "";
        return s.Replace("\\", "\\\\").Replace("\"", "\\\"")
                .Replace("\n", "\\n").Replace("\r", "\\r");
    }
}

// Extension LINQ minimale (Streamer.bot n'inclut pas toujours System.Linq)
static class LinqHelper
{
    public static System.Collections.Generic.IEnumerable<TResult>
        Select<TSource, TResult>(
            this System.Collections.Generic.IEnumerable<TSource> src,
            System.Func<TSource, TResult> selector)
    {
        foreach (var item in src) yield return selector(item);
    }
}
