// ============================================================
//  StreamAlerts — WriteAlert.cs
//  Script Streamer.bot (Execute C# Code)
//
//  UTILISATION :
//  Dans chaque action Streamer.bot, ajoute 2 sous-actions :
//    1. Set Argument  →  alertType  =  follow   (ou sub, raid…)
//    2. Execute C# Code  →  colle ce script
//
//  C'est tout. Le reste est automatique.
// ============================================================

using System;
using System.IO;

public class CPHInline
{
    // Chemin vers le fichier lu par l'overlay OBS
    const string FILE_PATH =
        @"D:\audri\Xamp\htdocs\StreamAlerts\alerts\data\alert.json";

    public bool Execute()
    {
        // ── TYPE ──────────────────────────────────────────────────
        // Valeurs acceptées :
        //   follow | sub | resub | giftsub | raid
        //   bits | donation | channelpoints | hype_train
        string alertType = Arg("alertType", "follow");

        // ── DONNÉES COMMUNES ──────────────────────────────────────
        string user    = Arg("user");
        string message = Arg("message");
        string avatar  = Arg("userProfileImageUrl");
        string tier    = Arg("subTier");

        // ── MONTANT — nom de variable différent selon l'événement ─
        int amount = 0;
        if      (Has("bits"))     amount = Int("bits");      // Cheer / Bits
        else if (Has("viewers"))  amount = Int("viewers");   // Raid
        else if (Has("gifts"))    amount = Int("gifts");     // Gift Sub (Twitch)
        else if (Has("quantity")) amount = Int("quantity");  // Gift Sub (variante)
        else if (Has("amount"))   amount = Int("amount");    // Donation

        // ── MOIS — resub uniquement ───────────────────────────────
        int months = Int("cumulative"); // total des mois abonnés

        // ── TIMESTAMP — doit être unique à chaque alerte ─────────
        long ts = DateTimeOffset.UtcNow.ToUnixTimeSeconds();

        // ── JSON ──────────────────────────────────────────────────
        string json =
            "{\n" +
            $"  \"type\": \"{alertType}\",\n" +
            $"  \"user\": \"{J(user)}\",\n" +
            $"  \"message\": \"{J(message)}\",\n" +
            $"  \"avatar\": \"{J(avatar)}\",\n" +
            $"  \"sound\": \"{alertType}.mp3\",\n" +
            $"  \"amount\": {amount},\n" +
            $"  \"months\": {months},\n" +
            $"  \"tier\": \"{J(tier)}\",\n" +
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

    private bool Has(string key)
        => args.ContainsKey(key)
            && args[key] != null
            && args[key].ToString() != ""
            && args[key].ToString() != "0";

    private int Int(string key)
    {
        if (!args.ContainsKey(key) || args[key] == null) return 0;
        int.TryParse(args[key].ToString(), out int val);
        return val;
    }

    // Échappement JSON minimal
    private string J(string s)
    {
        if (string.IsNullOrEmpty(s)) return "";
        return s.Replace("\\", "\\\\")
                .Replace("\"",  "\\\"")
                .Replace("\n",  "\\n")
                .Replace("\r",  "\\r")
                .Replace("\t",  "\\t");
    }
}
