export interface Participant {
    _id: string;
    username: string;
  }
  
  export class Plan {
    constructor(
      public id: string,
      public title: string,
      public description: string,
      public location: {
        address: string;
        coordinates: [number, number];
      },
      public tags: string[],
      public dateTime: string,
      public maxParticipants: number,
      public participants: Participant[],
      public imageUrl: string,
      public status: string
    ) {}
  
    static fromApiResponse(apiData: any): Plan {
      return new Plan(
        apiData._id,
        apiData.title,
        apiData.description,
        apiData.location,
        apiData.tags,
        apiData.dateTime,
        apiData.maxParticipants,
        apiData.participants,
        apiData.imageUrl,
        apiData.status
      );
    }
  }
  