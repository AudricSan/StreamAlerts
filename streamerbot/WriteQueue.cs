// ============================================================
//  StreamAlerts — WriteQueue.cs
//  Script Streamer.bot (Execute C# Code)
//
//  Gère la file d'attente des viewers.
//
//  COMMANDES — créer une action par commande chat :
//    !join   →  Set Argument queueCommand = join   + user = %user%
//    !leave  →  Set Argument queueCommand = leave  + user = %user%
//    !next   →  Set Argument queueCommand = next   (mod/broadcaster uniquement)
//    !queue open  →  queueCommand = open
//    !queue close →  queueCommand = close
//    !queue clear →  queueCommand = clear
// ============================================================

using System;
using System.IO;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

public class CPHInline
{
    // Modifier ce chemin si StreamAlerts est installé ailleurs
    const string BASE_PATH = @"D:\audri\Xamp\htdocs\StreamAlerts";

    const string FILE_PATH = BASE_PATH + @"\overlay\data\queue.json";

    public bool Execute()
    {
        string command      = Arg("queueCommand", "join");
        string user         = Arg("user");
        bool   isMod        = Bool("isModerator");
        bool   isBroadcaster= Bool("isBroadcaster");
        bool   isPrivileged = isMod || isBroadcaster;

        // ── Lire l'état courant ───────────────────────────────────
        JObject queue;
        if (File.Exists(FILE_PATH))
        {
            try { queue = JObject.Parse(File.ReadAllText(FILE_PATH, System.Text.Encoding.UTF8)); }
            catch { queue = DefaultQueue(); }
        }
        else { queue = DefaultQueue(); }

        JArray entries = (queue["entries"] as JArray) ?? new JArray();
        bool   isOpen  = (bool)(queue["isOpen"] ?? false);

        // ── Exécuter la commande ──────────────────────────────────
        switch (command.ToLower())
        {
            case "join":
                if (!isOpen) break;
                bool already = false;
                foreach (var e in entries) { if ((string)e["user"] == user) { already = true; break; } }
                if (!already && user != "") entries.Add(new JObject { ["user"] = user });
                break;

            case "leave":
                for (int i = entries.Count - 1; i >= 0; i--)
                    if ((string)entries[i]["user"] == user) { entries.RemoveAt(i); break; }
                break;

            case "next":
                if (isPrivileged && entries.Count > 0) entries.RemoveAt(0);
                break;

            case "open":
                if (isPrivileged) queue["isOpen"] = true;
                break;

            case "close":
                if (isPrivileged) queue["isOpen"] = false;
                break;

            case "clear":
                if (isPrivileged) entries.Clear();
                break;
        }

        queue["entries"]   = entries;
        queue["timestamp"] = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();

        File.WriteAllText(FILE_PATH, queue.ToString(Formatting.Indented), System.Text.Encoding.UTF8);
        return true;
    }

    private JObject DefaultQueue()
        => new JObject { ["isOpen"] = false, ["entries"] = new JArray(), ["timestamp"] = 0 };

    // ── Helpers ───────────────────────────────────────────────────

    private string Arg(string key, string fallback = "")
        => args.ContainsKey(key) && args[key] != null
            ? args[key].ToString().Trim()
            : fallback;

    private bool Bool(string key)
        => args.ContainsKey(key)
            && args[key] != null
            && (args[key].ToString().ToLower() == "true" || args[key].ToString() == "1");
}
