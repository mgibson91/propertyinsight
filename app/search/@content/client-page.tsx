'use client';

import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button, Heading, Select } from '@radix-ui/themes';
import { PropertyListingModel, PropertyListingsSummary } from '@/repository/property-listings/get-property-listings';
import { useRouter, useSearchParams } from 'next/navigation';

export default function ClientSearchPage({
  initialProperties,
  summary,
  initialPage,
  itemsPerPage,
}: {
  initialProperties: PropertyListingModel[];
  summary: PropertyListingsSummary & {
    avgPrice: number;
    avgBedrooms: number;
    avgReceptions: number;
    medianPrice: number;
  };
  initialPage: number;
  itemsPerPage: number;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [currentItemsPerPage, setCurrentItemsPerPage] = useState(itemsPerPage);

  const handlePageChange = (newPage: number) => {
    if (newPage < 1) return;
    setCurrentPage(newPage);
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage.toString());
    params.set('limit', currentItemsPerPage.toString());
    router.push(`/search?${params.toString()}`);
  };

  const handleItemsPerPageChange = (value: string) => {
    const newItemsPerPage = parseInt(value, 20);
    setCurrentItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', '1');
    params.set('limit', newItemsPerPage.toString());
    router.push(`/search?${params.toString()}`);
  };

  const formatPropertyType = (type: string): string => {
    return type
      .replace(/([a-z])([A-Z])/g, '$1 $2') // Add space before capital letters
      .replace(/^./, str => str.toUpperCase()); // Capitalize the first letter
  };

  const renderPropertyTable = (properties: PropertyListingModel[]) => (
    <Table className="relative">
      <TableHeader className="sticky top-0 bg-primary-base shadow-[0_2px_0px_0px_rgba(0,0,0,0.3)] shadow-primary-text-contrast">
        <TableRow>
          <TableHead>Price</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Bedrooms</TableHead>
          <TableHead>Receptions</TableHead>
          <TableHead>Town</TableHead>
          <TableHead>Postcode</TableHead>
          <TableHead></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody className="flex-1 h-0">
        {properties.map(property => (
          <TableRow key={property.id} className="text-primary-text">
            <TableCell>£{property.price.toLocaleString()}</TableCell>
            <TableCell>{formatPropertyType(property.type)}</TableCell>
            <TableCell>{property.bedrooms}</TableCell>
            <TableCell>{property.receptions}</TableCell>
            <TableCell>{property.address.town}</TableCell>
            <TableCell>{property.address.postcode}</TableCell>
            <TableCell>
              {/* <Dialog>
                <DialogTrigger asChild>
                  <Button variant="secondary" size="sm">
                    View
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{formatPropertyType(property.type)} Property Details</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 items-center gap-4">
                      <span className="font-medium">Price:</span>
                      <span>
                        £{property.price.toLocaleString()}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 items-center gap-4">
                      <span className="font-medium">Address:</span>
                      <span>
                        {property.address.line1} {property.address.line2} {property.address.town}{' '}
                        {property.address.postcode}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 items-center gap-4">
                      <span className="font-medium">Type:</span>
                      <span>{formatPropertyType(property.type)}</span>
                    </div>
                    <div className="grid grid-cols-2 items-center gap-4">
                      <span className="font-medium">Bedrooms:</span>
                      <span>{property.bedrooms}</span>
                    </div>
                    <div className="grid grid-cols-2 items-center gap-4">
                      <span className="font-medium">Receptions:</span>
                      <span>{property.receptions}</span>
                    </div>
                  </div>
                </DialogContent>
              </Dialog> */}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  const startCount = (currentPage - 1) * currentItemsPerPage + 1;
  const endCount = Math.min(currentPage * currentItemsPerPage, summary.total);

  return (
    <div className="p-8 w-full overflow-hidden flex-1 flex flex-col">
      <section className="mb-8">
        <Heading as="h2" size="6" className="mb-4">
          Summary
        </Heading>
        <Table>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium">Total Listings:</TableCell>
              <TableCell>{summary.total}</TableCell>
              <TableCell className="font-medium">Min price:</TableCell>
              <TableCell>£{summary.minPrice.toLocaleString()}</TableCell>
              <TableCell className="font-medium">Max price:</TableCell>
              <TableCell>£{summary.maxPrice.toLocaleString()}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Average Price:</TableCell>
              <TableCell>£{summary.avgPrice.toLocaleString()}</TableCell>
              <TableCell className="font-medium">Median Price:</TableCell>
              <TableCell>£{summary.medianPrice.toLocaleString()}</TableCell>
              <TableCell className="font-medium">Average Bedrooms:</TableCell>
              <TableCell>{summary.avgBedrooms.toFixed(2)}</TableCell>
              <TableCell className="font-medium">Average Receptions:</TableCell>
              <TableCell>{summary.avgReceptions.toFixed(2)}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </section>

      <section className="flex-1 flex flex-col">
        <Heading as="h3" size="4" className="font-semibold mb-2">
          Showing {startCount} to {endCount} of {summary.total} properties found
        </Heading>
        <div className="h-0 min-h[200px] overflow-y-auto flex-auto">{renderPropertyTable(initialProperties)}</div>
      </section>

      <div className="flex flex-col md:flex-row justify-between items-center mt-4">
        <div className="mb-4 md:mb-0">
          <label htmlFor="itemsPerPage" className="mr-2">
            Items per page:
          </label>
          <Select.Root value={currentItemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
            <Select.Trigger className="" />
            <Select.Content>
              <Select.Item value="5">5</Select.Item>
              <Select.Item value="10">10</Select.Item>
              <Select.Item value="20">20</Select.Item>
              <Select.Item value="50">50</Select.Item>
            </Select.Content>
          </Select.Root>
        </div>

        <div className="flex items-center">
          <Button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
            Previous
          </Button>
          <span className="mx-2">Page {currentPage}</span>
          <Button onClick={() => handlePageChange(currentPage + 1)}>Next</Button>
        </div>
      </div>
    </div>
  );
}
