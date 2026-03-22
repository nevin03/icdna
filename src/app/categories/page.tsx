import { Suspense } from 'react';
import { Categories } from './Categories';

export default function CategoriesPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Categories />
    </Suspense>
  );
}

