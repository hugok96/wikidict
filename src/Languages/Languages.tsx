import React, {ChangeEvent} from 'react';
import './Languages.css';
import {LanguageData} from "../Types";
import {Language} from "./Language/Language";
import {LanguageService} from "../Services/LanguageService";

export class Languages extends React.Component<{}, {languages: LanguageData[], searchValue: string, displayedLanguages: LanguageData[], collapsed: boolean}> {
  constructor(props : any) {
    super(props);
    this.state = {
      searchValue: '',
      languages: LanguageService.languages,
      displayedLanguages: LanguageService.languages,
      collapsed: localStorage.getItem('collapsed') === '1'
    };
  }

  async componentDidMount() {
    LanguageService.onLanguagesChanged(() => {
      this.setState({languages: LanguageService.languages})
    })
  }

  toggleCollapse() {
    let newState = !this.state.collapsed;
    this.setState({collapsed: newState})
    localStorage.setItem('collapsed', newState ? '1' : '0');
  }

  onSearch(evt : ChangeEvent<HTMLInputElement>) {
    let val = evt.target.value;
    this.setState({
      searchValue: val
    });

    val = val.trim().toLowerCase();
    if(val === '')
      this.setState({displayedLanguages: this.state.languages})
    else
      this.setState({displayedLanguages: this.state.languages.filter(l => l.id.toLowerCase() === val || l.name.toLowerCase().indexOf(val) !== -1 || l.localizedName.toLowerCase().indexOf(val) !== -1)})
  }

  get classes() : string {
    let res = "languages";
    if(this.state.collapsed)
      res += " collapsed";
    return res;
  }

  render() {
      return <div className={this.classes}>
        <button onClick={() => this.toggleCollapse()} title="collapse languages">&gt;&lt;</button>
        <input type="text" value={this.state.searchValue} placeholder="search for a language..."  onChange={evt => this.onSearch(evt)}/>
        <ul>
          {this.state.displayedLanguages.map((lang : any) => {
            return <Language language={lang} key={"lang_"+lang.id}></Language>
          }) }
        </ul>
      </div>
  }
}