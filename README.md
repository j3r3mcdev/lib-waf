# 🔥 BLF Elite — Web Application Firewall (lib-waf)

Un WAF modulaire, extensible et intelligent pour Node.js / TypeScript, intégrant :

- Détection avancée (SQLi, XSS, LFI, RFI, Path Traversal…)
- Détection métier (Business Rules)
- Détection comportementale (Sequence Anomaly)
- Modes avancés (Shadow Mode, Learning Mode Global)
- Architecture provider/detector propre et testable
- 100% compatible microservices (scoring-service externe)

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
