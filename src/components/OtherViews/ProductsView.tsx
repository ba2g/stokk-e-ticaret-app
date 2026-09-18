import React from 'react';
import { B2BProductGrid } from '../Products/B2BProductGrid';
import { Product, GridColumnConfig } from '../../types';

interface ProductsViewProps {
  products: Product[];
  columns: GridColumnConfig[];
  onOpenColumnConfig: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
  onOpenProductDetail: (product: Product) => void;
  onSelectProductToMatrix: (product: Product) => void;
  onOpenAddProduct: () => void;
  searchTerm: string;
  onSearchChange: (val: string) => void;
  activeFilterType?: string;
  activeFilterValue?: string;
  onClearFilter?: () => void;
}

export const ProductsView: React.FC<ProductsViewProps> = ({
  products,
  columns,
  onOpenColumnConfig,
  onAddToCart,
  onOpenProductDetail,
  onSelectProductToMatrix,
  onOpenAddProduct,
  searchTerm,
  onSearchChange,
  activeFilterType,
  activeFilterValue,
  onClearFilter,
}) => {
  return (
    <B2BProductGrid
      products={products}
      columns={columns}
      onOpenColumnConfig={onOpenColumnConfig}
      onAddToCart={onAddToCart}
      onOpenProductDetail={onOpenProductDetail}
      onGoToVariantMatrix={onSelectProductToMatrix}
      onOpenAddProduct={onOpenAddProduct}
      searchTerm={searchTerm}
      onSearchChange={onSearchChange}
      activeFilterType={activeFilterType}
      activeFilterValue={activeFilterValue}
      onClearFilter={onClearFilter}
    />
  );
};
