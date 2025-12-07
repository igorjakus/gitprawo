# Git Prawo

### Opis

Portal na zasadzie GitHuba pokazujący wszelkie zmiany prawne (z podziałami na różne kategorie)
_ do eskportu do PDF
_ kodeks prawny w formie protalu
_ stworzenie bota AI do sprawdzania poprawności jezykowej - język na poziomie B2
_ repozytoria (we współpracy z prawnikami i odpowiednimi władzami)

### Przydatne linki

- https://www.canva.com/design/DAG6uphIc1E/M8P4o7dQcnUdLVNS7EF9-Q/edit?utm_content=DAG6uphIc1E&utm_campaign=designshare&utm_medium=link2&utm_source=sharebutton
- https://www.europarl.europa.eu/legislative-train/schedule

### Zalety GitPrawa

*Aktywne wdrażanie dyrektyky europejskiej ws. upraszczania języka legislacyjnego
*Możliwość porady prawnej przy użyciu ChatBota (model językowy typu ChatGPT)
\*Klarowny i Ułatwiony dostęp do historii zmian aktów prawnych wraz z podsumowaniem AI pokazujacym jakie zmiany zostały ostatnio wprowadzone

---

### Kluczowe funkcjonalności

**Użytkownicy**

1. Powinny byc mozliwe tworzenie kont chronionych shashowanymi haslami.
2. Trzy rodzaje uprawnien:
   - Administrator
   - Osoba znajaca sie na prawie czyli Ekspert (Nadaje administrator)
   - Zwykly uzytkownik / obywatel sledzacy zmiany w repozytoriach

Administrator i Ekspert moga tworzyc repozytoria i edytowac opisy w nich. Zwykly uzytkownik moze sledzic w nich zmiany i komentowac w sekcji do komentarzy

**Najnowsza wersja dokumentu**

1. Export do pliku `.pdf`
2. Rendering do pdfa, albo jakiegoś innego czytelnego formatu, gdzie użytkownik może podejrzeć treść bez pobierania.
3. Nie mamy ustalonego formatu w którym są przechowywane pliki z dokumentami prawnymi, może to być markdown jeżeli będzie to najprostsze w kontroli wersji.

**Historyczne wersje dokumentu:**
Dla każdej zmiany:

- data
- streszczenie AI
- zmiany w stylu githuba / pipeline na Jenkins
- os czasu zmian jakiegos prawnego artykulu
- opis z pull-requesta

**Pull requesty**

1. Możliwość edytowania plików przez pull-requesty.
2. Dodawania opisu do PRa.
3. Sprawdzanie AI pod kątem prostoty słownictwa – automatyczny check, czy jest napisana językiem polskim na poziomie B2
4. Wstępne sprawdzenie błędów językowych
5. Komentarze
6. (opcjonalnie) tagowanie pullrequestów istotnością

**(OPCJONALNIE) Chatbot asystent**
Nie realizujemy (decyzja produktowa), więc pomijamy.

**Deployment**
Vercel, lub coś jeszcze prostszego. Z darmowym free-tierem.

**Tech stack**

- Frontend: Next.js
- Backend: Next.js
- Baza danych: Postgresql, może być przez np. Neon dla uproszczenia

**Źródło danych**
Ręczne przepisywanie Kodeksu Karnego czy Cywilnego jest niemożliwe. Potrzebny jest scraper/importer (np. z ISAP - Internetowy System Aktów Prawnych), który przekonwertuje obecne PDF-y/HTML-e sejmowe na Markdown. Możemy początkowo mieć tylko 1-3 dokumenty prawne. Skrypt, który bo to robił zapewne najlepiej, żeby był w Pythonie.

**Struktura repozytoriów**
Każdy większy kodeks/dokument prawny, powinien być osobnym repozytorium. Rozdział dokumentu na pliki nie jest jeszcze jasny. Możemy początkowo wybrać najprostszą opcje.

**Autentykacja i autoryzacja**
Może być początkowo zamockowana. Użytkownicy typu obywatel mogą komentować, pytać chatbota itp. Jedynie użytkownicy typu prawnik mogą wprowadzać zmiany.

**UI/UX**

1. Bardzo estetyczny design przy pomocy Next.js
2. Potencjalnie możliwość użycia gotowych komponentów.
3. Intuicyje w użyciu, nieprzekombinowane.
4. Diff w stylu githuba pokazujący zmiany.

---

### Kluczowe Funkcjonalności

**1. Wizualizacja Ścieżki Legislacyjnej ("Legislative Train")**

- Interaktywna oś czasu pokazująca status aktu: Prekonsultacje → Rząd → Sejm/Senat → Prezydent.
- Dla każdego "wagonika" (etapu) widoczne są kluczowe dokumenty i status prac.

**2. Tłumacz Prawny AI (Plain Language)**

- Nie tylko korekta, ale **tłumaczenie urzędniczego języka na prosty język** w czasie rzeczywistym.
- Analiza poziomu trudności tekstu (standard B2/C1), na etapie pull-requestów.

**4. Transparentne Konsultacje (Pre- i Post-)**

- Możliwość zgłaszania uwag obywatelskich już na etapie pomysłu (Issues).
- Subskrypcja powiadomień o zmianach w konkretnych aktach prawnych.

---

### Architektura Informacji: Mapowanie Git na Proces Legislacyjny

Aby system był zrozumiały dla administracji, używamy metaforyki legislacyjnej opartej na silniku Gita:

- **Repository:** Kodeks lub Ustawa.
- **Issue:** Etap Prekonsultacji / Zgłoszenie problemu społecznego.
- **Branch:** Projekt nowelizacji / Projekt rządowy.
- **Pull Request:** Oficjalny proces legislacyjny (Sejm/Senat). Tu toczy się dyskusja, poprawki komisji i głosowania.
- **Commit:** Pojedyncza zmiana w treści przepisu.
- **Merge:** Podpis Prezydenta i publikacja w Dzienniku Ustaw.
- **Conflict:** Weto Prezydenta lub odrzucenie przez Senat.

---

### Rozwiązania Techniczne

**Frontend & UX**: Next.js, React

**Baza danych**: PostgreSQL Neon

**AI & NLP**: LLM (przez API) do wsparcia ekspertów, oraz obywateli

**Deployment**: Vercel

**Autoryzacja i autentykacja:** Działająca autoryzacja i autentykacja, z podziałem użytkowników na zwykłych, expertów (prawników, urzędników itp.), oraz adminsitratorów.

### Scenariusz Użycia (User Journey)

**Aktor: Obywatel**

1.  Wchodzi na stronę i widzi "Rozkład jazdy" dla ustawy o Ochronie Środowiska.
2.  Widzi, że projekt jest na etapie "Konsultacji".
3.  Klika w "Zobacz zmiany" – widzi porównanie (Diff) starego i nowego prawa.
4.  Nie rozumie Art. 5 – klika "Wyjaśnij mi to" i otrzymuje proste podsumowanie AI.
5.  Zostawia komentarz (Issue) w sekcji konsultacji.

**Aktor: Urzędnik/Legislator**

1.  Tworzy nową gałąź (Branch) dla projektu nowelizacji.
2.  Edytuje treść ustawy w edytorze Markdown/WYSIWYG.
3.  System automatycznie oznacza zmiany i generuje Ocenę Skutków (Impact Analysis).
4.  Otwiera "Proces Legislacyjny" (Pull Request) i zaprasza interesariuszy do opiniowania.

---

### Disclaimer

_Aplikacja jest prototypem (PoC). Prezentowane treści prawne mają charakter poglądowy. Jedynym źródłem prawa w RP jest Dziennik Ustaw. Chatbot AI pełni funkcję edukacyjną, nie stanowi porady prawnej._

---

### Backlog

Newsletter z miesięcznymi zmianami.
