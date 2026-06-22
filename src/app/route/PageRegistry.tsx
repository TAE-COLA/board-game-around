import { useToast } from '@chakra-ui/react';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CommonError } from 'shared';

export type PageProps = {
  navigate: ReturnType<typeof useNavigate>;
  toast: ReturnType<typeof useToast>;
};

export interface PageRegistry {
  LoginPage: React.FC<PageProps>;
  RegisterPage: React.FC<PageProps>;
  MainPage: React.FC<PageProps>;
  LoungePage: React.FC<PageProps>;
  YachtDicePage: React.FC<PageProps>;
  DavinciCodePage: React.FC<PageProps>;
  TheMindPage: React.FC<PageProps>;
}

export const createPageRegistry = (): PageRegistry => {
  const registry: Partial<PageRegistry> = {};

  return new Proxy(registry, {
    get(target, prop: keyof PageRegistry) {
      const value = target[prop];
      if (!value) {
        throw new Error(CommonError.PAGE_NOT_INITIALIZED(prop));
      }
      return value;
    },
    set(target, prop: keyof PageRegistry, value) {
      target[prop] = value;
      return true;
    },
  }) as PageRegistry;
};

export const pageRegistry = createPageRegistry();
