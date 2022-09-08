import {LanguageData} from "../Types";
import {Languages} from "../Languages/Languages";

export class LanguageService {
    public static languages : LanguageData[] = [];
    private static callbacks : (()=>void)[] = [];

    public static onLanguagesChanged(callback : () => void) {
        this.callbacks.push(callback);
    }

    public static setLanguages(languages : LanguageData[]) : void {
        this.languages = languages;
        this.callbacks.forEach(c => c());
    }

    public static get selectedLanguages() : LanguageData[] {
        return this.languages.filter(l => l.active);
    }

    public static isIdSelected(id : string) : boolean {
        return this.languages.filter(l => l.id.trim().toLowerCase() === id.trim().toLowerCase()).length > 0;
    }

    public static isNameSelected(name : string) : boolean {
        return this.languages.filter(l => l.name.trim().toLowerCase() === name.trim().toLowerCase()).length > 0;
    }

    public static toggleLanguage(id : string) {
        this.languages.filter(l => l.id.trim().toLowerCase() === id.trim().toLowerCase()).forEach(l => l.active = !l.active );
        this.saveLanguages();
        this.callbacks.forEach(c => c());
    }

    private static saveLanguages() {
        localStorage.setItem('selected_languages', JSON.stringify(this.languages.filter(l => l.active).map(l => l.id)));
    }

    private static initializeLanguages() {
        let selected = JSON.parse(localStorage.getItem('selected_languages') ?? '["en"]')
        this.languages.forEach(l => {
            l.active = selected.filter((s:string) => s === l.id).length > 0;
        });
        this.callbacks.forEach(c => c());
    }

    public static async fetchLanguages() {
        const fetchRes = await fetch("https://wikistats.wmcloud.org/display.php?t=wt");
        let el: HTMLHtmlElement | null = document.createElement('html');
        el.innerHTML = await fetchRes.text();
        el = el.querySelector('#table > tbody')
        const len = el?.children?.length ?? 0;
        for (let i = 0; i < len; i++) {
            let row = el?.children?.item(i);
            this.languages.push({
                name: row?.children.item(1)?.textContent ?? "",
                localizedName: row?.children.item(2)?.textContent ?? "",
                id: row?.children.item(3)?.textContent ?? "",
                active: false
            });

            if(this.languages[this.languages.length - 1].id === 'en')
                this.languages[this.languages.length - 1].active = true;


        }

        this.initializeLanguages();
        this.callbacks.forEach(c => c());
    }
}