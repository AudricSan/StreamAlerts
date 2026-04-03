// ============================================================
//  StreamAlerts — WritePrediction.cs
//  Affiche la prédiction Twitch active dans l'overlay.
//
//  Configurer dans Streamer.bot :
//    1. Créer une action "Prediction"
//    2. Déclencher sur les événements Twitch :
//       ⚡ Prediction Created  → affiche la prédiction
//       ⚡ Prediction Updated  → met à jour les points
//       ⚡ Prediction Locked   → verrouille (plus de paris)
//       ⚡ Prediction Resolved → masque la prédiction
//       ⚡ Prediction Canceled → masque la prédiction
//    3. Sous-action "Execute C# Code" → coller ce script
//
//  Arguments Streamer.bot (injectés automatiquement) :
//    %predictionTitle%        — question posée
//    %predictionOutcome0Title% — option 1 (bleu)
//    %predictionOutcome0Points% — points misés sur l'option 1
//    %predictionOutcome1Title% — option 2 (rose)
//    %predictionOutcome1Points% — points misés sur l'option 2
//    %predictionStatus%        — "active" | "locked" | "resolved" | "canceled"
//    %predictionPredictionWindow% — durée en secondes
//
//  Note : noms exacts à vérifier dans l'onglet Variables de Streamer.bot.
// ============================================================

using System;
using System.IO;
using System.Collections.Generic;

public class CPHInline
{
    const string FILE_PATH =
        @"D:\audri\Xamp\htdocs\StreamAlerts\overlay\data\prediction.json";

    public bool Execute()
    {
        string title  = Arg("predictionTitle");
        string status = Arg("predictionStatus", "active").ToLower();

        bool active  = status == "active" || status == "locked";
        long now     = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
        long window  = Int("predictionPredictionWindow") * 1000L;
        long startedAt = now - (window > 0 ? window : 0);
        long endsAt    = window > 0 ? startedAt + window : 0;
        long lockedAt  = status == "locked" ? now : 0;

        // Lecture des options (2 max pour une prédiction Twitch)
        var options = new List<(string Title, int Points)>();
        for (int i = 0; i < 2; i++)
        {
            string t = Arg($"predictionOutcome{i}Title");
            if (string.IsNullOrEmpty(t)) break;
            int pts  = Int($"predictionOutcome{i}Points");
            options.Add((t, pts));
        }

        // Construction du JSON
        long ts   = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
        var  rows = new List<string>();
        foreach (var o in options)
            rows.Add($"    {{\"title\":\"{J(o.Title)}\",\"points\":{o.Points}}}");

        string json =
            "{\n" +
            $"  \"title\": \"{J(title)}\",\n" +
            $"  \"active\": {(active ? "true" : "false")},\n" +
            $"  \"startedAt\": {startedAt},\n" +
            $"  \"endsAt\": {endsAt},\n" +
            $"  \"lockedAt\": {lockedAt},\n" +
            $"  \"options\": [\n{string.Join(",\n", rows)}\n  ],\n" +
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
