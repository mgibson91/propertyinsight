import React, { useEffect, useState } from 'react';
import { FilterIcon, LayersIcon } from 'lucide-react';
import { Checkbox, IconButton, Popover, TextField } from '@radix-ui/themes';
import cx from 'classnames';
import { CloseIcon } from 'next/dist/client/components/react-dev-overlay/internal/icons/CloseIcon';
import { MagnifyingGlassIcon, PlusIcon, TriangleDownIcon } from '@radix-ui/react-icons';

export const MultiSelect = ({
  options,
  itemName,
  selectedIds,
  toggleOption,
  renderItem,
  placeholderIcon,
  placeholder,
  addItem,
  clearSelection,
}: {
  options: { label: string; id: string }[]; // key: value
  itemName: {
    single: string;
    plural: string;
  };
  selectedIds: string[]; // keys
  toggleOption: (option: string) => void;
  placeholderIcon?: React.ReactNode;
  placeholder?: string;
  renderItem?: (input: {
    options: { label: string; id: string }[];
    item: { id: string; label: string };
    selectedIds: string[];
    toggleOption: (option: string) => void;
  }) => React.ReactNode;
  addItem?: (item: string) => void;
  clearSelection?: () => void;
  variant?: 'surface' | 'ghost';
}) => {
  const [filter, setFilter] = useState('');
  const [selectedOnly, setSelectedOnly] = useState(false);

  const [filteredOptions, setFilteredOptions] = useState<{ label: string; id: string }[]>([]);

  useEffect(() => {
    if (!filter && !selectedOnly) {
      setFilteredOptions(options);
      return;
    }

    const lowerCaseFilter = filter.toLowerCase();

    const filtered = options.filter(({ label, id }) => {
      const passesSearchFilter = label.toLowerCase().includes(lowerCaseFilter);
      const passesSelectedFilter = selectedOnly ? selectedIds.includes(id) : true;

      return passesSearchFilter && passesSelectedFilter;
    });

    setFilteredOptions(filtered);
  }, [options, selectedIds, selectedOnly, filter]);

  return (
    <Popover.Root>
      <Popover.Trigger>
        <div
          className={cx(
            'w-full flex flex-row items-center flex-wrap gap-2 px-2 border border-accent-border bg-accent-bg-subtle opacity-100 rounded-md h-[40px] cursor-pointer'
          )}
        >
          <div className={'flex flex-row w-full justify-between items-center pl-2'}>
            <div className={'flex flex-row gap-1 leading-[0]'}>
              {selectedIds.length ? (
                <p>
                  {selectedIds.length} {selectedIds.length > 1 ? itemName.plural : itemName.single}{' '}
                  <span className="invisible lg:visible">selected</span>
                </p>
              ) : (
                <div className={'pl-1 flex flex-row items-center gap-2'}>
                  {placeholderIcon}
                  <p className="text-sm text-primary-solid-hover">{placeholder}</p>
                </div>
              )}
            </div>

            <div className={'flex flex-row items-center gap-2'}>
              {clearSelection && selectedIds.length > 0 && (
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
        </div>
      </Popover.Trigger>
      <Popover.Content>
        <div className="w-full h-full overflow-hidden p-1">
          <div className={'w-full flex flex-row items-center gap-3 mb-2'}>
            <div className={'flex-auto flex justify-between items-center gap-2'}>
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

              {/* @ts-ignore */}
              <Checkbox
                size={'3'}
                checked={selectedOnly}
                onCheckedChange={state => {
                  setSelectedOnly(state === true);
                }}
              >
                Selected only
              </Checkbox>
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

          <div className={'flex flex-col gap-1 max-h-[300px] overflow-auto'}>
            {filteredOptions.map(({ id, label }) => (
              <div key={id} className={'flex flex-row items-center justify-between'}>
                {renderItem ? (
                  renderItem({ options, item: { id, label }, toggleOption, selectedIds })
                ) : (
                  <div
                    className={
                      'flex flex-row gap-2 items-center w-full cursor-pointer  rounded-md p-1 hover:bg-primary-bg-hover'
                    }
                    onClick={() => {
                      toggleOption(id);
                    }}
                  >
                    <Checkbox className="*:!cursor-pointer" checked={selectedIds.includes(id)}></Checkbox>
                    <div className={'w-full'}>{label}</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </Popover.Content>
    </Popover.Root>
  );
};

export const MultiSelectFilterWidget = ({
  options,
  itemName,
  selectedIds,
  setSelectedIds,
  placeholder,
  placeholderIcon,
  renderItem,
}: {
  options: { label: string; id: string }[];
  itemName: {
    single: string;
    plural: string;
  };
  selectedIds: string[];
  setSelectedIds: (ids: string[]) => void;
  placeholder: string;
  placeholderIcon?: React.ReactNode;
  renderItem?: (input: {
    options: { label: string; id: string }[];
    item: { id: string; label: string };
    selectedIds: string[];
    toggleOption: (option: string) => void;
  }) => React.ReactNode;
}) => {
  return (
    <div className="w-full bg-accent-bg-subtle">
      <MultiSelect
        options={options}
        itemName={itemName}
        selectedIds={selectedIds}
        placeholder={placeholder}
        placeholderIcon={placeholderIcon || <FilterIcon className="h-4 w-4" />}
        toggleOption={toggledId => {
          // Array of newly selected categories
          const newSelectedCategories = selectedIds.includes(toggledId)
            ? selectedIds.filter((id: string) => id !== toggledId)
            : [...selectedIds, toggledId];

          setSelectedIds(newSelectedCategories);
        }}
        clearSelection={() => {
          setSelectedIds([]);
        }}
        renderItem={renderItem}
      />
    </div>
  );
};
