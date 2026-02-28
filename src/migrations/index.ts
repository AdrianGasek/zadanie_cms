import * as migration_20260228_225208_remove_page_type_collections from './20260228_225208_remove_page_type_collections';

export const migrations = [
  {
    up: migration_20260228_225208_remove_page_type_collections.up,
    down: migration_20260228_225208_remove_page_type_collections.down,
    name: '20260228_225208_remove_page_type_collections'
  },
];
