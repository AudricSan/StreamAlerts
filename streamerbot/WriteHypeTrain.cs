// ============================================================
//  StreamAlerts — WriteHypeTrain.cs
//  Affiche la progression du Hype Train en temps réel.
//
//  Configurer dans Streamer.bot :
//    1. Créer une action "HypeTrain"
//    2. Déclencher sur les événements Twitch :
//       ⚡ Hype Train Start   → démarre le widget
//       ⚡ Hype Train Update  → met à jour la progression
//       ⚡ Hype Train End     → masque le widget (active: false)
//    3. Sous-action "Execute C# Code" → coller ce script
//
//  Arguments Streamer.bot (injectés automatiquement) :
//    %hypeTrainLevel%       — niveau actuel (1, 2, 3…)
//    %hypeTrainTotal%       — points totaux accumulés
//    %hypeTrainGoal%        — objectif du niveau actuel
//    %hypeTrainDuration%    — durée totale en secondes (ex: 300)
//    %hypeTrainExpiresAt%   — timestamp UNIX (ms) de fin
//    %hypeTrainTop1User%    — pseudo du top contributeur 1
//    %hypeTrainTop1Amount%  — montant du top contributeur 1
//    %hypeTrainTop2User%    — pseudo du top contributeur 2
//    %hypeTrainTop2Amount%  — montant du top contributeur 2
//    %hypeTrainTop3User%    — pseudo du top contributeur 3
//    %hypeTrainTop3Amount%  — montant du top contributeur 3
//    hypeTrainEnd = "true"  → Set Argument pour l'action End
//
//  Note : noms exacts à vérifier dans l'onglet Variables de Streamer.bot.
// ============================================================

using System;
using System.IO;
using System.Collections.Generic;

public class CPHInline
{
    const string FILE_PATH =
        @"D:\audri\Xamp\htdocs\StreamAlerts\overlay\data\hypetrain.json";

    public bool Execute()
    {
        bool isEnd = Arg("hypeTrainEnd", "false").ToLower() == "true";

        long ts = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();

        if (isEnd)
        {
            // Fin du Hype Train → masquer le widget
            string endJson =
                "{\n" +
                $"  \"level\": 1,\n" +
                $"  \"progress\": 0,\n" +
                $"  \"goal\": 100,\n" +
                $"  \"active\": false,\n" +
                $"  \"startedAt\": 0,\n" +
                $"  \"endsAt\": 0,\n" +
                $"  \"duration\": 300,\n" +
                $"  \"contributors\": [],\n" +
                $"  \"timestamp\": {ts}\n" +
                "}";
            File.WriteAllText(FILE_PATH, endJson, System.Text.Encoding.UTF8);
            return true;
        }

        int  level    = Math.Max(1, Int("hypeTrainLevel"));
        int  progress = Int("hypeTrainTotal");
        int  goal     = Math.Max(1, Int("hypeTrainGoal"));
        int  duration = Int("hypeTrainDuration");
        long expiresAt= LongArg("hypeTrainExpiresAt");

        if (duration <= 0) duration = 300; // défaut 5 min
        if (expiresAt <= 0) expiresAt = ts + duration * 1000L;

        // Top contributeurs
        var contribs = new List<string>();
        for (int i = 1; i <= 3; i++)
        {
            string u = Arg($"hypeTrainTop{i}User");
            int    a = Int($"hypeTrainTop{i}Amount");
            if (!string.IsNullOrEmpty(u))
                contribs.Add($"    {{\"user\":\"{J(u)}\",\"amount\":{a}}}");
        }

        string json =
            "{\n" +
            $"  \"level\": {level},\n" +
            $"  \"progress\": {progress},\n" +
            $"  \"goal\": {goal},\n" +
            $"  \"active\": true,\n" +
            $"  \"startedAt\": {ts},\n" +
            $"  \"endsAt\": {expiresAt},\n" +
            $"  \"duration\": {duration},\n" +
            $"  \"contributors\": [\n{string.Join(",\n", contribs)}\n  ],\n" +
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

    private long LongArg(string key)
    {
        if (!args.ContainsKey(key) || args[key] == null) return 0;
        long.TryParse(args[key].ToString(), out long val);
        return val;
    }

    private string J(string s)
    {
        if (string.IsNullOrEmpty(s)) return "";
        return s.Replace("\\", "\\\\").Replace("\"", "\\\"")
                .Replace("\n", "\\n").Replace("\r", "\\r");
    }
}
