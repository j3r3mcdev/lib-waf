# 🔥 BLF Elite — Web Application Firewall (lib-waf)

BLF Elite est un **WAF (Web Application Firewall)** pour Node.js / TypeScript.  
Son rôle : **protéger ton API** contre les attaques, les comportements suspects et les usages anormaux.

Il ne remplace pas le code métier.  
Il **observe**, **analyse**, **détecte**, **apprend**, et **bloque si nécessaire**.

Voici tout ce qu’il couvre, expliqué simplement.

---

## 🔍 1. Détection avancée (attaques techniques)

Ton WAF analyse chaque requête HTTP et cherche des signes d’attaques connues.

### **SQL Injection (SQLi)**

Empêche qu’un attaquant injecte du SQL dans tes paramètres.

Exemples :

- `?id=1 OR 1=1`
- `'; DROP TABLE users; --`

### **Cross-Site Scripting (XSS)**

Empêche l’injection de JavaScript dans des champs affichés côté client.

Exemples :

- `<script>alert(1)</script>`
- `<img src=x onerror=alert(1)>`

### **Local File Inclusion (LFI)**

Empêche l’accès à des fichiers locaux via des paramètres.

Exemples :

- `?file=../../etc/passwd`

### **Remote File Inclusion (RFI)**

Empêche le chargement de fichiers distants malveillants.

Exemples :

- `?file=http://evil.com/shell.php`

### **Path Traversal**

Empêche qu’on sorte d’un dossier pour accéder à d’autres fichiers.

Exemples :

- `/download?path=../../../var/log`

👉 **En clair :** le WAF repère les patterns d’attaque dans les URL, body, headers, etc.

---

## 🧩 2. Détection métier (Business Rules)

Ici, on ne parle plus d’attaques techniques, mais de **logique métier**.

Le WAF détecte les comportements qui n’ont **aucun sens** dans ton application.

Exemples :

- Accéder à `/checkout` sans être connecté
- Accéder à `/admin` sans rôle admin
- Faire 200 resets password en 1 minute
- Créer 50 comptes depuis la même IP

👉 **Le WAF comprend ton métier et repère les usages anormaux.**

---

## 🔁 3. Détection comportementale (Sequence Anomaly)

Le WAF ne regarde plus seulement une requête, mais **la suite de requêtes**.

Il détecte :

- les transitions bizarres
- les séquences impossibles
- les boucles suspectes
- les parcours incohérents

Exemples :

- `/login` → `/admin/config` (sans passer par `/admin`)
- `/login` répété 50 fois (bruteforce)
- `/register` → `/payment/confirm` sans `/payment`

👉 **Il repère les comportements de bots, scanners, scripts, etc.**

---

## 🎛️ 4. Modes avancés

### 🔦 Shadow Mode (mode observation)

Le WAF :

- détecte
- analyse
- calcule une décision (block/allow)
- **mais ne bloque jamais réellement**

Il enregistre juste ce qui **aurait été bloqué**.

Idéal pour :

- tester en production
- ajuster les règles
- éviter les faux positifs

👉 **Mode “je vois tout, mais je touche à rien”.**

---

### 🧠 Learning Mode Global (auto-apprentissage)

Le WAF apprend automatiquement :

- quelles routes sont les plus utilisées
- quels comportements sont normaux
- quelles séquences sont habituelles
- quelles IP ont un usage stable ou suspect

Il stocke :

- `learning.global` → stats globales
- `learning.ip` → stats par IP
- `learning.sequence` → séquences par session

👉 **Il construit une base de référence pour détecter les anomalies.**

---

## 🧱 5. Architecture provider/detector (simple et modulaire)

Ton WAF est construit comme un système de **LEGO** :

### **Providers**

Ils fournissent des infos :

- IP
- route
- séquence
- identité
- fréquence
- contexte

### **Detectors**

Ils analysent ces infos et génèrent des alertes (“findings”).

Avantages :

- tu peux ajouter un detector sans toucher au reste
- tu peux remplacer un provider sans casser le système
- chaque brique est testable indépendamment
- c’est propre, modulaire, maintenable

👉 **Une architecture pensée pour évoluer.**

---

## 🧭 6. Compatible microservices (scoring-service externe)

Ton WAF peut déléguer la décision finale à un service externe.

### Le WAF envoie :

```json
{
  "findings": [...],
  "context": {
    "ip": "1.2.3.4",
    "sessionId": "abc",
    "routes": ["/login", "/admin"]
  }
}
```

### Le scoring-service répond :

```json
{
  "score": 87,
  "action": "block",
  "reputation": "bad"
}
```

### Le WAF :

- en **mode normal** → applique la décision
- en **shadow mode** → ne bloque pas, mais enregistre

👉 **Tu peux brancher du ML, de la réputation IP, du graph, etc.**

---

## 🧩 Résumé simple

Ce WAF protège ton API en :

- détectant les attaques techniques
- repérant les comportements suspects
- comprenant la logique métier
- analysant les séquences de navigation
- apprenant ce qui est normal
- bloquant uniquement quand c’est sûr
- observant sans bloquer en shadow mode
- pouvant déléguer la décision à un scoring-service

C’est un **pare-feu intelligent**, **modulaire**, **testable**, **évolutif**, et **safe-by-design**.

---

## 🚀 Installation

```bash
npm install @j3r3mcdev/auth-service
```

---

## 📦 Architecture interne

```
src/
 ├─ waf/
 │   ├─ waf.ts
 │   ├─ context.ts
 │   └─ decision-engine.ts
 │
 ├─ providers/
 │   ├─ business/
 │   │   ├─ flow-tracker.provider.ts
 │   │   ├─ route-profiler.provider.ts
 │   │   ├─ behavior-rate.provider.ts
 │   │   └─ identity.provider.ts
 │
 ├─ detectors/
 │   ├─ technical/
 │   │   ├─ sqli/
 │   │   ├─ xss/
 │   │   ├─ lfi/
 │   │   ├─ rfi/
 │   │   └─ path/
 │   ├─ business/
 │   │   ├─ sequence-anomaly.detector.ts
 │   │   └─ business-rules.detector.ts
 │
 ├─ modes/
 │   ├─ shadow-mode.ts
 │   └─ learning-mode.ts
 │
 └─ middleware/
     ├─ pre-auth/
     └─ advanced/
```

---

## 🧠 Providers (sources de vérité)

Les providers alimentent les detectors :

| Provider                | Rôle                                |
| ----------------------- | ----------------------------------- |
| `FlowTrackerProvider`   | Suit les séquences de navigation    |
| `RouteProfilerProvider` | Analyse les patterns de routes      |
| `BehaviorRateProvider`  | Analyse les comportements temporels |
| `IdentityProvider`      | Suit l’identité (IP, UA, session…)  |

Aucun provider supplémentaire n’est requis pour BLF Elite.

---

## 🛡️ Detectors techniques

### SQLi / XSS / LFI / RFI / Path Traversal

Chaque detector renvoie :

```ts
{
  detector: string;
  severity: number;
  message: string;
  meta?: any;
}
```

Ils sont exécutés automatiquement dans le pipeline WAF.

---

## 🧩 Detectors métier (BLF Elite)

### 🔹 Sequence Anomaly Detector

Détecte :

- transitions interdites
- séquences anormales
- boucles suspectes (A→B→A→B)

### 🔹 Business Rules Detector

Détecte les violations métier :

- accès à `/purchase` sans login
- accès à `/export` sans premium
- admin venant d’un ASN non autorisé

---

## 🎛️ Modes avancés

### 🔥 Shadow Mode (monitoring)

- Le WAF détecte
- Le WAF envoie findings
- Le WAF reçoit une décision théorique
- Le WAF **n’applique pas** la décision
- Le WAF **enregistre** dans `shadow.decisions`

Aucun blocage réel.

### 🧠 Learning Mode Global (auto‑apprentissage)

Apprend automatiquement :

- fréquences de routes
- séquences par session
- patterns par IP
- comportements normaux

Stocké dans :

```
learning.global
learning.ip
learning.sequence
```

---

## 🧪 Tests

La lib contient plus de **120 tests Jest**, couvrant :

- detectors techniques
- detectors métier
- providers
- modes
- WAF complet
- middleware avancé

Exécution :

```bash
npm run test
```

---

## 🧱 Exemple d’utilisation

```ts
import { Waf } from "./waf/waf";
import { ShadowMode } from "./modes/shadow-mode";
import { LearningMode } from "./modes/learning-mode";

const waf = new Waf({
  shadowMode: new ShadowMode({ enabled: true }),
  learningMode: new LearningMode({ enabled: true }),
});

app.use(async (req, res, next) => {
  const ctx = await waf.run(req, res);

  // En shadow mode : jamais de blocage
  if (ctx.finalDecision?.action === "block" && !ctx.shadowModeEnabled) {
    return res.status(403).json({ error: "Blocked by WAF" });
  }

  next();
});
```

---

## 🧭 Intégration scoring-service (externe)

Le WAF envoie :

```json
{
  "findings": [...],
  "context": { "ip": "...", "sessionId": "..." }
}
```

Le scoring-service renvoie :

```json
{
  "score": 42,
  "action": "block",
  "reputation": "bad"
}
```

En Shadow Mode → **pas de blocage**  
En Mode Normal → **blocage si action = block**

---

## 📄 Licence

MIT

---

## 👤 Auteur

**Jérémy Corbella — j3r3mcdev**  
Développeur backend & architecte sécurité.
