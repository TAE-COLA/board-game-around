import { pageRegistry } from 'app';
import {
  DavinciCodePage,
  LoginPage,
  LoungePage,
  MainPage,
  RegisterPage,
  TheMindPage,
  YachtDicePage,
} from 'features';

export const initPages = () => {
  pageRegistry.DavinciCodePage = DavinciCodePage;
  pageRegistry.LoginPage = LoginPage;
  pageRegistry.LoungePage = LoungePage;
  pageRegistry.MainPage = MainPage;
  pageRegistry.RegisterPage = RegisterPage;
  pageRegistry.TheMindPage = TheMindPage;
  pageRegistry.YachtDicePage = YachtDicePage;
};
