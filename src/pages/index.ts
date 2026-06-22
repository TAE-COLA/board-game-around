import { pageRegistry } from 'app';
import { DavinciCodePage } from './davinci-code';
import { LoginPage } from './login';
import { LoungePage } from './lounge';
import { MainPage } from './main';
import { RegisterPage } from './register';
import { TheMindPage } from './the-mind';
import { YachtDicePage } from './yacht-dice';

export const initPages = () => {
  pageRegistry.DavinciCodePage = DavinciCodePage;
  pageRegistry.LoginPage = LoginPage;
  pageRegistry.LoungePage = LoungePage;
  pageRegistry.MainPage = MainPage;
  pageRegistry.RegisterPage = RegisterPage;
  pageRegistry.TheMindPage = TheMindPage;
  pageRegistry.YachtDicePage = YachtDicePage;
};
