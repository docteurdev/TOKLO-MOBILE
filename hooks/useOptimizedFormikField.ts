import { useState, useEffect, useCallback } from 'react';
import { useField } from 'formik';

/**
 * Hook personnalisé pour optimiser les inputs Formik avec debounce
 * @param name - Nom du champ Formik
 * @param debounceMs - Délai de debounce en millisecondes (défaut: 200ms)
 * @returns Objet avec les handlers et valeurs optimisés
 */
export const useOptimizedFormikField = (name: string, debounceMs: number = 200) => {
  const [field, meta, helpers] = useField(name);
  const [localValue, setLocalValue] = useState(field.value || '');
  const [isDirty, setIsDirty] = useState(false);

  // Synchronisation de la valeur locale avec Formik
  useEffect(() => {
    if (!isDirty) {
      setLocalValue(field.value || '');
    }
  }, [field.value, isDirty]);

  // Debounce pour la mise à jour de Formik
  useEffect(() => {
    if (!isDirty) return;

    const timeoutId = setTimeout(() => {
      if (localValue !== field.value) {
        helpers.setValue(localValue);
      }
      setIsDirty(false);
    }, debounceMs);

    return () => clearTimeout(timeoutId);
  }, [localValue, helpers.setValue, field.value, isDirty, debounceMs]);

  // Handler optimisé pour le changement de texte
  const handleTextChange = useCallback((text: string) => {
    setLocalValue(text);
    setIsDirty(true);
  }, []);

  // Handler pour le blur avec synchronisation immédiate
  const handleBlur = useCallback(() => {
    helpers.setTouched(true);
    // Synchronisation immédiate lors du blur
    if (localValue !== field.value) {
      helpers.setValue(localValue);
    }
    setIsDirty(false);
  }, [localValue, field.value, helpers.setTouched, helpers.setValue]);

  return {
    value: localValue,
    onChangeText: handleTextChange,
    onBlur: handleBlur,
    meta,
    helpers
  };
};