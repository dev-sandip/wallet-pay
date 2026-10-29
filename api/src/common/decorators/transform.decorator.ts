import { Transform } from 'class-transformer';

/** Trim string fields */
export const Trim = () =>
  Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  );

/** Lowercase string fields (emails, slugs) */
export const Lowercase = () =>
  Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.toLowerCase() : value,
  );

/** Coerce "1"/"true"/"yes" -> true, everything else -> false */
export const ToBoolean = () =>
  Transform(({ value }: { value: unknown }) =>
    value === true || value === 'true' || value === '1' || value === 'yes',
  );

/** Coerce CSV string or single value -> string[] */
export const ToArray = () =>
  Transform(({ value }: { value: unknown }) => {
    if (value == null || value === '') return undefined;
    if (Array.isArray(value)) return value;
    return String(value)
      .split(',')
      .map((v) => v.trim())
      .filter(Boolean);
  });
