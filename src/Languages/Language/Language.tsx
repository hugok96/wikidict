import React from 'react';
import './Language.css';
import {LanguageData} from "../../Types";
import {LanguageService} from "../../Services/LanguageService";

export class Language extends React.Component<{language: LanguageData}, {language: LanguageData}> {
  constructor(props : any) {
    super(props);
    this.state = { language: this.props.language};

  }

  async componentDidMount() {
    LanguageService.onLanguagesChanged(() => {
      this.setState({language: LanguageService.languages.filter(l => l.id === this.state.language.id)[0]})
    })
  }

  toggleLanguage() {
      //this.state.language.active = !this.state.language.active;
      //this.setState({language: this.state.language})
      LanguageService.toggleLanguage(this.state.language.id);

  }

  get classes() : string {
      let classes = ["language"];
      if(this.props.language.active)
          classes.push('active');
      return classes.join(' ');
  }

  render() {
      return  <li className={this.classes} title={this.state.language.name} onClick={this.toggleLanguage.bind(this)}>
              <label>{this.state.language.localizedName}</label>
          </li>

  }
}