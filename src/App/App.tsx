import React, {ChangeEvent, useMemo} from 'react';
import './App.css';
import {Initializing} from "../Initializing/Initializing";
import {LanguageData} from "../Types";
import {Languages} from "../Languages/Languages";
import _, {debounce} from "lodash";
import {LanguageService} from "../Services/LanguageService";

export class App extends React.Component<any, {initialized: boolean, source: string, searchRes: null|HTMLBodyElement, filteredSearchRes: null|HTMLBodyElement, languages: LanguageData[], loading: boolean}> {
    private initialMountPerformed: boolean = false;

    constructor(props: any) {
        super(props);
        this.state = {initialized: false, source: "en", searchRes: null, filteredSearchRes: null, languages: [], loading: false};
    }

    async componentDidMount() {
        if (this.initialMountPerformed)
            return;

        this.initialMountPerformed = true;
        this.debouncedOnSearch = debounce(this.onSearch.bind(this), 750)

        LanguageService.fetchLanguages();
        LanguageService.onLanguagesChanged(() => {
            this.setState({initialized: true, languages: LanguageService.languages}, () => {
                this.filterResults();
            });

        })
    }

    debouncedOnSearch : any = null;

    async onSearch(evt: ChangeEvent<HTMLInputElement>) {
        this.setState({loading: true}, async () => {
            let value = evt.target.value;
            const fetchRes = await fetch(`https://${this.state.source}.wiktionary.org/w/rest.php/v1/page/${value}/html`);
            let el: HTMLHtmlElement | null = document.createElement('html');
            el.innerHTML = await fetchRes.text();
            this.setState({searchRes: el.getElementsByTagName('body')[0], loading: false}, () => this.filterResults());
        })
    }

    filterResults() {
        if(this.state.searchRes === null)
            return;

        let filteredResult = document.createElement('body');
        console.log(this.state.searchRes)
        this.state.searchRes.childNodes.forEach((node ) => {
            if(node?.firstChild?.nodeName === 'i' || node?.firstChild?.nodeName === 'div' || (node?.firstChild as HTMLElement)?.id === 'Translingual')
                filteredResult.appendChild(node.cloneNode(true));
            else if(this.displayedLanguages.filter(l => l.name === (node?.firstChild as HTMLElement)?.id).length > 0) {
                filteredResult.appendChild(node.cloneNode(true));
            }
        });
        this.setState({filteredSearchRes: filteredResult})
    }

    get displayedLanguages() : LanguageData[] {
        return this.state.languages.filter(l=>l.active);
    }

    onSourceChange(value: string) {
        this.setState({source: value});
    }

    renderMain() {
        return <main>
            { this.state.loading && <Initializing></Initializing>}
            <div id="searchbar">
                <select onChange={(evt) => this.onSourceChange(evt.target.value)} title="The *.wiktionary source">
                    {this.state.languages.map(l => {
                        return <option value={l.id} key={"source_"+l.id}>{l.id}</option>
                    })}
                </select>
                <input type="text" placeholder='search for a word...' onChange={this.debouncedOnSearch} disabled={this.state.loading}/>
            </div>
            <div id="results" dangerouslySetInnerHTML={{__html: this.state.filteredSearchRes?.innerHTML ?? ''}} data-test={this.state.languages.filter(l=>l.active).map(l => l.name).join(',')}>

            </div>
        </main>
    }

    render() {
        return (
            <div className="App">
                {!this.state.initialized && <Initializing></Initializing>}
                {this.state.initialized && <Languages></Languages> }
                {this.state.initialized && this.renderMain() }
            </div>
        );
    }
}