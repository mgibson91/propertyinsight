import React from 'react';
import { Checkbox, IconButton, Popover, Separator, TextField } from '@radix-ui/themes';
import { DividerHorizontalIcon, MagnifyingGlassIcon, PlusIcon, TriangleDownIcon } from '@radix-ui/react-icons';
import { Chip } from './ui/chip';
import cx from 'classnames';
import { CloseIcon } from 'next/dist/client/components/react-dev-overlay/internal/icons/CloseIcon';
import { Search, SearchIcon } from 'lucide-react';

/**
 * Input to set filter
 * Input list of options
 * Filter by label (not value)
 * On click item, add to selected
 */
export const MultiSelect = ({
  options,
  selected,
  toggleOption,
  renderItem,
  placeholderIcon,
  placeholder,
  addItem,
  clearSelection,
  variant = 'surface',
}: {
  options: Record<string, string>; // key: value
  selected: string[]; // keys
  toggleOption: (option: string) => void;
  placeholderIcon?: React.ReactNode;
  placeholder?: string;
  renderItem?: (
    options: Record<string, string>,
    option: string,
    toggleOption: (option: string) => void
  ) => React.ReactNode;
  addItem?: (item: string) => void;
  clearSelection?: () => void;
  variant?: 'surface' | 'ghost';
}) => {
  const [filter, setFilter] = React.useState('');

  const filteredOptions: Record<string, string> = React.useMemo(() => {
    return Object.entries(options).reduce((acc: Record<string, string>, [key, value]) => {
      const notSelected = !selected.includes(key);
      const notFiltered = !filter || value.toLowerCase().includes(filter.toLowerCase());

      if (notSelected && notFiltered) {
        acc[key] = value;
      }

      return acc;
    }, {});
  }, [options, selected, filter]);

  return (
    <Popover.Root>
      <Popover.Trigger>
        <div
          className={cx(
            'w-full flex flex-row items-center flex-wrap gap-2 px-1 border border-accent-border bg-accent-bg-subtle opacity-100 rounded-md h-[40px] cursor-pointer'
          )}
        >
          <div className={'flex flex-row w-full justify-between items-center'}>
            <div className={'flex flex-row gap-1'}>
              {selected.length ? (
                selected.map(option => (
                  <div
                    onClick={
                      // Stop prop
                      e => {
                        e.stopPropagation();
                      }
                    }
                  >
                    <Chip key={option} name={options[option]} onDelete={() => toggleOption(option)}></Chip>
                  </div>
                ))
              ) : (
                <div className={'pl-1 flex flex-row items-center gap-2'}>
                  {placeholderIcon}
                  <p className="text-sm text-primary-solid-hover">{placeholder}</p>
                </div>
              )}
            </div>

            {clearSelection && (
              <IconButton
                className={'h-4 w-4 !py-0 !px-1 !mr-0'}
                variant={'ghost'}
                onClick={e => {
                  clearSelection();
                }}
              >
                <CloseIcon></CloseIcon>
              </IconButton>
            )}
            <IconButton variant={'ghost'} className="!m-0" size={'1'}>
              <TriangleDownIcon className="h-4 w-4" />
            </IconButton>
          </div>
        </div>
      </Popover.Trigger>
      <Popover.Content>
        <div className={'flex flex-col gap-1'}>
          <div className={'w-full flex flex-row items-center gap-3 mb-2'}>
            <div className={'flex-auto'}>
              <TextField.Root
                size={'2'}
                className={'flex-auto w-full'}
                value={filter}
                onChange={e => setFilter(e.currentTarget.value)}
              >
                <TextField.Slot side={'left'}>
                  <MagnifyingGlassIcon height="16" width="16" />
                </TextField.Slot>
              </TextField.Root>
            </div>

            {addItem && (
              <IconButton
                onClick={() => {
                  if (addItem) {
                    addItem(filter);
                  }
                }}
              >
                <PlusIcon />
              </IconButton>
            )}
          </div>

          {Object.entries(filteredOptions).map(([key, value]) => (
            <div key={key} className={'flex flex-row items-center justify-between'}>
              {renderItem ? (
                renderItem(options, key, toggleOption)
              ) : (
                <div
                  className={'cursor-pointer w-full rounded-md p-1 hover:bg-primary-bg-hover'}
                  onClick={() => {
                    toggleOption(key);
                  }}
                >
                  {value}
                </div>
              )}
            </div>
          ))}
        </div>
      </Popover.Content>
    </Popover.Root>
  );
};
