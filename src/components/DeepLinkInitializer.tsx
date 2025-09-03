import React from 'react';
import { useDeepLinking } from '../hooks/useDeepLinking';

const DeepLinkInitializer: React.FC = () => {
  useDeepLinking();
  return null; // Этот компонент не рендерит ничего
};

export default DeepLinkInitializer;

