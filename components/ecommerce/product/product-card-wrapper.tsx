import React, { ReactNode } from 'react';
import FormSectionCard from './form-section-card';

type Props = {
    icons: ReactNode;
    title: string;
    children: ReactNode
}

const ProductCardWrapper = ({icons, title, children}: Props) => {
  return <FormSectionCard icon={icons} title={title}>{children}</FormSectionCard>
}

export default ProductCardWrapper
