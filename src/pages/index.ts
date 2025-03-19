import { pageRegistry } from 'app';
import { DavinciCodePage } from './davinci_code';
import { LoginPage } from './login';
import { LoungePage } from './lounge';
import { MainPage } from './main';
import { RegisterPage } from './register';
import { YachtDicePage } from './yacht_dice';

export const initPages = () => {
  pageRegistry.DavinciCodePage = DavinciCodePage;
  pageRegistry.LoginPage = LoginPage;
  pageRegistry.LoungePage = LoungePage;
  pageRegistry.MainPage = MainPage;
  pageRegistry.RegisterPage = RegisterPage;
  pageRegistry.YachtDicePage = YachtDicePage;
};
