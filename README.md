# LitpII

**LitpII** è una web app semplice per gestire attività domestiche, lista della spesa e debiti tra coinquilini.

L’app non usa un database: salva tutto in file CSV dentro il repository GitHub, così i dati restano sempre sincronizzati e facilmente consultabili.

## Funzionalità
- **Attività (Chores):** aggiunta, completamento e storico delle attività.  
- **Shopping:** lista condivisa di articoli da acquistare.  
- **Debiti:** registrazione e aggiornamento dei debiti tra utenti.

## Come funziona
L’app è sviluppata con **Next.js**.  
Ogni azione degli utenti aggiorna automaticamente i file CSV presenti nella cartella `data/`.

## Sviluppo
Per avviare il progetto in locale:

```bash
pnpm install
pnpm dev
```

È necessario un token GitHub con permessi di lettura e scrittura sui contenuti del repo.