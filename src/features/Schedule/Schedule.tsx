import * as React from 'react';

import { Grid, TextField, LinearProgress } from '@mui/material';

import { ScheduleTable } from './components/ScheduleTable/ScheduleTable';
import { ScheduleType, SCHEDULE_PARAMS } from '../../constants';
import { ICity, IParams } from '../../types';
import { CitySelect } from './components/CitySelect';
import { useGetSchedule } from './hooks/useGetSchedule';
import { AirportTitle, RouteLink, ScheduleWrapper, MenuWrapper, Wrapper } from './styled';
import { ICities, IFlight, ISchedule } from './types';

interface IProps {
  city: ICity;
  scheduleType: ScheduleType;
}

export const Schedule = (props: IProps) => {
  const [selectedCity, setSelectedCity] = React.useState<TrustedHTML | null>(null);
  const [airlineValue, setAirlineValue] = React.useState<string>('');

  const { data: schedule, isLoading } = useGetSchedule<ISchedule, IParams>(
    props.city.endPoints.schedule,
    {
      flightLeg: SCHEDULE_PARAMS[props.scheduleType],
    },
    ['flightLeg', props.scheduleType]
  );

  const filteredData = React.useMemo(() => {
    if (!selectedCity && !airlineValue) {
      return schedule?.data.flights ?? [];
    }

    return (
      schedule?.data.flights.filter((flight) => {
        return (
          (!selectedCity ||
            (props.scheduleType === ScheduleType.Arrivals
              ? flight.path.origin.originRu
              : flight.path.destination.destinationRu) === selectedCity) &&
          (!airlineValue || flight.airlineName.toUpperCase().includes(airlineValue.toUpperCase()))
        );
      }) ?? []
    );
  }, [schedule, selectedCity, airlineValue]);

  const cities = React.useMemo(() => {
    return new Set(
      schedule?.data.flights.map((flight: IFlight) =>
        props.scheduleType === ScheduleType.Arrivals
          ? flight.path.origin.originRu
          : flight.path.destination.destinationRu
      )
    );
  }, [schedule]);

  const handleAirlineChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAirlineValue(e.target.value.toUpperCase());
  };

  if (isLoading) return <LinearProgress />;

  return (
    <Wrapper>
      <AirportTitle>{props.city.name} </AirportTitle>

      <MenuWrapper>
        <RouteLink onClick={() => setSelectedCity(null)} to={`/${props.city.routeId}/${ScheduleType.Departures}`}>
          Отправление
        </RouteLink>
        <RouteLink onClick={() => setSelectedCity(null)} to={`/${props.city.routeId}/${ScheduleType.Arrivals}`}>
          Прибытие
        </RouteLink>
      </MenuWrapper>

      <Grid container spacing={2} marginTop={1} marginBottom={2}>
        <Grid item xs={3}>
          <TextField fullWidth placeholder="Авиакомпания" size="small" onChange={handleAirlineChange} />
        </Grid>
        <Grid item xs={3}>
          {schedule && <CitySelect cities={cities as ICities} onSelect={setSelectedCity} />}
        </Grid>
      </Grid>

      {schedule && (
        <>
          <div>{schedule.data.currentTime}</div>
          <ScheduleWrapper>
            <ScheduleTable flights={filteredData} scheduleType={props.scheduleType} />
          </ScheduleWrapper>
        </>
      )}
    </Wrapper>
  );
};
