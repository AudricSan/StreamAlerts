// ============================================================
//  StreamAlerts — WriteChat.cs
//  Script Streamer.bot (Execute C# Code)
//
//  UTILISATION :
//  Crée une action "[ StreamAlerts] Chat" avec le déclencheur
//  Twitch → Chat Message, puis un seul sous-action :
//    Execute C# Code  →  colle ce script
//
//  Aucun argument manuel nécessaire — tout est lu automatiquement.
// ============================================================

using System;
using System.IO;

public class CPHInline
{
    // Modifier ce chemin si StreamAlerts est installé ailleurs
    const string BASE_PATH = @"D:\audri\Xamp\htdocs\StreamAlerts";

    const string FILE_PATH = BASE_PATH + @"\overlay\data\chat.json";

    public bool Execute()
    {
        // ── DONNÉES DU MESSAGE ─────────────────────────────────────
        string user    = Arg("user");
        string message = Arg("rawInput") != "" ? Arg("rawInput") : Arg("message");
        string color   = Arg("userColor") != "" ? Arg("userColor") : Arg("color");

        // Ignorer les messages vides ou de bots connus
        if (string.IsNullOrWhiteSpace(user) || string.IsNullOrWhiteSpace(message))
            return true;

        // ── BADGES / RÔLES ─────────────────────────────────────────
        // Streamer.bot expose ces variables en booléen (True/False)
        bool isSub         = Bool("isSubscriber");
        bool isMod         = Bool("isModerator");
        bool isVip         = Bool("isVip");
        bool isBroadcaster = Bool("isBroadcaster");

        // ── TIMESTAMP UNIQUE ───────────────────────────────────────
        // Utilise les millisecondes pour que deux messages
        // arrivant la même seconde soient bien distincts.
        long ts = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();

        // ── JSON ───────────────────────────────────────────────────
        string json =
            "{\n" +
            $"  \"user\":          \"{J(user)}\",\n" +
            $"  \"color\":         \"{J(color)}\",\n" +
            $"  \"message\":       \"{J(message)}\",\n" +
            $"  \"isSub\":         {isSub.ToString().ToLower()},\n" +
            $"  \"isMod\":         {isMod.ToString().ToLower()},\n" +
            $"  \"isVip\":         {isVip.ToString().ToLower()},\n" +
            $"  \"isBroadcaster\": {isBroadcaster.ToString().ToLower()},\n" +
            $"  \"timestamp\":     {ts}\n" +
            "}";

        // Fallback polling — le WebSocket natif de Streamer.bot gère le temps réel
        File.WriteAllText(FILE_PATH, json, System.Text.Encoding.UTF8);
        return true;
    }

    // ── Helpers ───────────────────────────────────────────────────

    private string Arg(string key, string fallback = "")
        => args.ContainsKey(key) && args[key] != null
            ? args[key].ToString().Trim()
            : fallback;

    private bool Bool(string key)
    {
        if (!args.ContainsKey(key) || args[key] == null) return false;
        return args[key].ToString().ToLower() == "true";
    }

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
