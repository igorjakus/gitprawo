import { getDiff } from '../../src/lib/get_diff';

const oldText = `Art. 1. [Podstawy stosunków cywilnoprawnych]
Kodeks cywilny normuje stosunki cywilnoprawne między osobami fizycznymi i prawnymi.

Art. 2. [Zasada ochrony konsumenta]
§ 1. Konsument jest chroniony na zasadach określonych w niniejszym kodeksie.
§ 2. Przez konsumenta rozumie się osobę fizyczną.

Art. 3. [Zdolność prawna]
Każdy człowiek od chwili urodzenia ma zdolność prawną.`;

const newText = `Art. 1. [Podstawy stosunków cywilnoprawnych]
Kodeks cywilny normuje stosunki cywilnoprawne między osobami fizycznymi i prawnymi.

Art. 2. [Zasada ochrony konsumenta]
§ 1. Konsument podlega szczególnej ochronie prawnej zgodnie z przepisami niniejszego kodeksu oraz regulacjami UE.
§ 2. Przez konsumenta rozumie się osobę fizyczną dokonującą czynności prawnej niezwiązanej bezpośrednio z jej działalnością gospodarczą lub zawodową.

Art. 3. [Zdolność prawna]
Każdy człowiek od chwili urodzenia ma zdolność prawną.`;

const diff = getDiff(oldText, newText);

console.log(JSON.stringify(diff, null, 2));
