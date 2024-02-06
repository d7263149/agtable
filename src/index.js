'use strict';

import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import 'ag-grid-enterprise';
import { AgGridReact } from 'ag-grid-react';
import React, {
  StrictMode,
  useCallback,
  useMemo,
  useRef,
  useState,
} from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

var dateFilterParams = {
  comparator: (filterLocalDateAtMidnight, cellValue) => {
    var cellDate = asDate(cellValue);
    if (filterLocalDateAtMidnight.getTime() === cellDate.getTime()) {
      return 0;
    }
    if (cellDate < filterLocalDateAtMidnight) {
      return -1;
    }
    if (cellDate > filterLocalDateAtMidnight) {
      return 1;
    }
    return 0;
  },
};

var ageType = 'everyone';

const asDate = (dateAsString) => {
  var splitFields = dateAsString.split('/');
  return new Date(
    Number.parseInt(splitFields[2]),
    Number.parseInt(splitFields[1]) - 1,
    Number.parseInt(splitFields[0])
  );
};

const GridExample = () => {
  const gridRef = useRef();
  const containerStyle = useMemo(() => ({ width: '100%', height: '100%' }), []);
  const gridStyle = useMemo(() => ({ height: '100%', width: '100%' }), []);
  const [rowData, setRowData] = useState();
  const [columnDefs, setColumnDefs] = useState([
    { field: 'athlete', minWidth: 180 },
    { field: 'age', filter: 'agNumberColumnFilter', maxWidth: 80 },
    { field: 'country' },
    { field: 'year', maxWidth: 90 },
    {
      field: 'date',
      filter: 'agDateColumnFilter',
      filterParams: dateFilterParams,
    },
    { field: 'gold', filter: 'agNumberColumnFilter' },
    { field: 'silver', filter: 'agNumberColumnFilter' },
    { field: 'bronze', filter: 'agNumberColumnFilter' },
  ]);
  const defaultColDef = useMemo(() => {
    return {
      flex: 1,
      minWidth: 120,
      filter: true,
    };
  }, []);

  const onGridReady = useCallback((params) => {
    fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
      .then((resp) => resp.json())
      .then((data) => {
        document.querySelector('#everyone').checked = true;
        setRowData(data);
      });
  }, []);

  const externalFilterChanged = useCallback((newValue) => {
    ageType = newValue;
    gridRef.current.api.onFilterChanged();
  }, []);

  const isExternalFilterPresent = useCallback(() => {
    // if ageType is not everyone, then we are filtering
    return ageType !== 'everyone';
  }, []);

  const doesExternalFilterPass = useCallback(
    (node) => {
      if (node.data) {
        switch (ageType) {
          case 'below25':
            return node.data.age < 25;
          case 'between25and50':
            return node.data.age >= 25 && node.data.age <= 50;
          case 'above50':
            return node.data.age > 50;
          case 'dateAfter2008':
            return asDate(node.data.date) > new Date(2008, 1, 1);
          default:
            return true;
        }
      }
      return true;
    },
    [ageType]
  );

  return (
    <div style={containerStyle}>
      <div className="test-container">
        <div className="test-header">
          <label>
            <input
              type="radio"
              name="filter"
              id="everyone"
              onChange={() => externalFilterChanged('everyone')}
            />
            Everyone
          </label>
          <label>
            <input
              type="radio"
              name="filter"
              id="below25"
              onChange={() => externalFilterChanged('below25')}
            />
            Below 25
          </label>
          <label>
            <input
              type="radio"
              name="filter"
              id="between25and50"
              onChange={() => externalFilterChanged('between25and50')}
            />
            Between 25 and 50
          </label>
          <label>
            <input
              type="radio"
              name="filter"
              id="above50"
              onChange={() => externalFilterChanged('above50')}
            />
            Above 50
          </label>
          <label>
            <input
              type="radio"
              name="filter"
              id="dateAfter2008"
              onChange={() => externalFilterChanged('dateAfter2008')}
            />
            After 01/01/2008
          </label>
        </div>

        <div
          style={gridStyle}
          className={
            "ag-theme-quartz"
          }
        >
          <AgGridReact
            ref={gridRef}
            rowData={rowData}
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            isExternalFilterPresent={isExternalFilterPresent}
            doesExternalFilterPass={doesExternalFilterPass}
            onGridReady={onGridReady}
          />
        </div>
      </div>
    </div>
  );
};

const root = createRoot(document.getElementById('root'));
root.render(
  <StrictMode>
    <GridExample />
  </StrictMode>
);
