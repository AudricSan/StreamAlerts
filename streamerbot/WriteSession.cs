// ============================================================
//  StreamAlerts — WriteSession.cs
//  Incrémente les compteurs de session dans session.json.
//
//  Configurer dans Streamer.bot :
//    Utiliser la MÊME action que WriteAlert.cs (ou une séparée).
//    Ajouter une sous-action "Set Argument" :
//      alertType = follow  (ou sub, bits, raid, donation)
//    Puis "Execute C# Code" → ce script.
//
//  Pour reset en début de stream :
//    Ajouter une action sur "Stream Online" avec alertType = "reset".
//
//  Triggers recommandés : identiques à WriteAlert.cs
//    ⚡ Follow, Subscribe, Re-Subscribe, Gift Subscription,
//       Cheer/Bits, Raid, Donation StreamElements/StreamLabs
// ============================================================

using System;
using System.IO;
using Newtonsoft.Json.Linq;

public class CPHInline
{
    const string FILE_PATH =
        @"D:\audri\Xamp\htdocs\StreamAlerts\overlay\data\session.json";

    public bool Execute()
    {
        string alertType = Arg("alertType", "");

        // Chargement du fichier existant
        JObject data;
        try
        {
            string existing = File.Exists(FILE_PATH) ? File.ReadAllText(FILE_PATH) : "{}";
            data = JObject.Parse(existing);
        }
        catch
        {
            data = new JObject();
        }

        // Reset de session
        if (alertType == "reset")
        {
            data["follows"]   = 0;
            data["subs"]      = 0;
            data["bits"]      = 0;
            data["raids"]     = 0;
            data["donations"] = 0;
            data["timestamp"] = 0; // masque le widget
            File.WriteAllText(FILE_PATH, data.ToString(Newtonsoft.Json.Formatting.Indented), System.Text.Encoding.UTF8);
            return true;
        }

        // Incrément selon le type d'événement
        switch (alertType)
        {
            case "follow":
                data["follows"] = (data["follows"]?.Value<int>() ?? 0) + 1;
                break;
            case "sub":
            case "resub":
            case "giftsub":
                data["subs"] = (data["subs"]?.Value<int>() ?? 0) + 1;
                break;
            case "bits":
                data["bits"] = (data["bits"]?.Value<int>() ?? 0) + Int("bits");
                break;
            case "raid":
                data["raids"] = (data["raids"]?.Value<int>() ?? 0) + 1;
                break;
            case "donation":
                data["donations"] = (data["donations"]?.Value<int>() ?? 0) + 1;
                break;
            default:
                return true; // type inconnu → rien
        }

        data["timestamp"] = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
        File.WriteAllText(FILE_PATH, data.ToString(Newtonsoft.Json.Formatting.Indented), System.Text.Encoding.UTF8);
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
}
