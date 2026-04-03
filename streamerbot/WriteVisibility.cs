// ============================================================
//  StreamAlerts — WriteVisibility.cs
//  Affiche / masque un composant de l'overlay depuis le chat.
//
//  Commandes (modérateur ou broadcaster uniquement) :
//    !show   <composant>   — rendre visible
//    !hide   <composant>   — masquer
//    !toggle <composant>   — basculer l'état
//
//  Alias acceptés :
//    alerts / alertes / alerte / alert
//    chat
//    follower / follow / lastfollow / lastfollower
//    sub / subscriber / lastsub / lastsubscriber
//    goal / objectif
//    train / subtrain
//    music / musique / nowplaying / chanson
//    queue / file
//
//  Configurer dans Streamer.bot :
//    1. Ajouter une action "Visibility"
//    2. Sous-action "Execute C# Code" → coller ce script
//    3. Créer 3 commandes chat : !show / !hide / !toggle
//       → chacune déclenche cette action
//    4. Cocher "Moderator" et "Broadcaster" dans les permissions
// ============================================================

using System;
using System.IO;
using System.Text.RegularExpressions;
using Newtonsoft.Json.Linq;

public class CPHInline
{
    // ── Chemin vers visibility.json ──────────────────────────────
    private const string VIS_PATH =
        @"D:\audri\Xamp\htdocs\StreamAlerts\overlay\data\visibility.json";

    // ── Alias commande → clé JSON ────────────────────────────────
    private static readonly System.Collections.Generic.Dictionary<string, string> ALIASES =
        new System.Collections.Generic.Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
    {
        { "alerts",         "alerts"         },
        { "alertes",        "alerts"         },
        { "alerte",         "alerts"         },
        { "alert",          "alerts"         },
        { "chat",           "chat"           },
        { "follower",       "lastFollower"   },
        { "follow",         "lastFollower"   },
        { "lastfollow",     "lastFollower"   },
        { "lastfollower",   "lastFollower"   },
        { "sub",            "lastSubscriber" },
        { "subscriber",     "lastSubscriber" },
        { "lastsub",        "lastSubscriber" },
        { "lastsubscriber", "lastSubscriber" },
        { "goal",           "goal"           },
        { "objectif",       "goal"           },
        { "train",          "subtrain"       },
        { "subtrain",       "subtrain"       },
        { "music",          "nowplaying"     },
        { "musique",        "nowplaying"     },
        { "nowplaying",     "nowplaying"     },
        { "chanson",        "nowplaying"     },
        { "queue",          "queue"          },
        { "file",           "queue"          },
    };

    public bool Execute()
    {
        // Vérifier permissions
        bool isMod  = args.ContainsKey("isModerator")   && Convert.ToBoolean(args["isModerator"]);
        bool isBroa = args.ContainsKey("isBroadcaster") && Convert.ToBoolean(args["isBroadcaster"]);
        if (!isMod && !isBroa) return true;

        // Lire le message brut (ex: "!toggle goal")
        string raw = args.ContainsKey("rawInput") ? args["rawInput"].ToString().Trim() : "";

        var match = Regex.Match(raw, @"^!(show|hide|toggle)\s+(\S+)", RegexOptions.IgnoreCase);
        if (!match.Success) return true;

        string action = match.Groups[1].Value.ToLower();
        string name   = match.Groups[2].Value.ToLower();

        if (!ALIASES.TryGetValue(name, out string cfgKey)) return true;

        // Lire le fichier JSON
        JObject vis;
        try {
            string json = File.Exists(VIS_PATH) ? File.ReadAllText(VIS_PATH) : "{}";
            vis = JObject.Parse(json);
        } catch {
            vis = new JObject();
        }

        // Calculer la nouvelle valeur
        bool current = vis[cfgKey] == null || vis[cfgKey].Value<bool>();
        bool newVal  = action == "show"   ? true
                     : action == "hide"   ? false
                     : !current;  // toggle

        vis[cfgKey] = newVal;

        // Écrire le fichier mis à jour
        File.WriteAllText(VIS_PATH, vis.ToString(Newtonsoft.Json.Formatting.Indented));

        return true;
    }
}
