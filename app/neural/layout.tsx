"use client";

import AutoMatrixLayout from '../../components/matrix/AutoMatrixLayout';

export default function NeuralLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AutoMatrixLayout>
      {children}
    </AutoMatrixLayout>
  );
} 