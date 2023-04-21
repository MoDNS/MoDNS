export const mockStatData = {
  label: "Queries Blocked",
  progress: 20,
  statistic: 123099,
  differenceFromLast: -150
}

export const mockStatusData = {
  status_label: 'Running',
  status_good: true,
}

export const mockPieData = [
  {
    "id": "elixir",
    "label": "elixir",
    "value": 218,
  },
  {
    "id": "javascript",
    "label": "javascript",
    "value": 533,
  },
  {
    "id": "rust",
    "label": "rust",
    "value": 579,
  },
  {
    "id": "php",
    "label": "php",
    "value": 120,
  },
  {
    "id": "go",
    "label": "go",
    "value": 69,
  }
];

export const mockTableData = {
  headers: [
    {
      field: 'name',
      headerName: 'Name',
      width: 300,
    },
    {
      field: 'email',
      headerName: 'Email',
      width: 400,
    },
    {
      field: 'age',
      headerName: 'Age',
      type: 'number',
      width: 100,
    },
    {
      field: 'phone',
      headerName: 'Phone',
      type: 'number',
      width: 200,
    },
  ],
  data: [
    {
      name: "Jon Snow",
      email: "jonsnow@gmail.com",
      age: 35,
      phone: "(665) 121-5454",
    },
    {
      name: "Cersei Lannister",
      email: "cerseilannister@gmail.com",
      age: 42,
      phone: "(421) 314-2288",
    },
    {
      name: "Jaime Lannister",
      email: "jaimelannister@gmail.com",
      age: 45,
      phone: "(422) 982-6739",
    },
    {
      name: "Anya Stark",
      email: "anyastark@gmail.com",
      age: 16,
      phone: "(921) 425-6742",
    },
    {
      name: "Daenerys Targaryen",
      email: "daenerystargaryen@gmail.com",
      age: 31,
      phone: "(421) 445-1189",
    },
    {
      name: "Ever Melisandre",
      email: "evermelisandre@gmail.com",
      age: 150,
      phone: "(232) 545-6483",
    },
    {
      name: "Ferrara Clifford",
      email: "ferraraclifford@gmail.com",
      age: 44,
      phone: "(543) 124-0123",
    },
    {
      name: "Rossini Frances",
      email: "rossinifrances@gmail.com",
      age: 36,
      phone: "(222) 444-5555",
    },
    {
      name: "Harvey Roxie",
      email: "harveyroxie@gmail.com",
      age: 65,
      phone: "(444) 555-6239",
    },
  ]
};

export const mockBarData = {
  index_by: "country",
  x_axis_label: 'Country',
  y_axis_label: 'Food',
  data: [
    {
      country: "AD",
      "hot dog": 137,
      burger: 96,
      kebab: 72,
      donut: 140,
    },
    {
      country: "AE",
      "hot dog": 55,
      burger: 28,
      kebab: 58,
      donut: 29,
    },
    {
      country: "AF",
      "hot dog": 109,
      burger: 23,
      burgerColor: "hl(96, 70%, 50%)",
      kebab: 34,
      donut: 152,
    },
    {
      country: "AG",
      "hot dog": 133,
      burger: 52,
      kebab: 43,
      donut: 83,
    },
    {
      country: "AI",
      "hot dog": 81,
      burger: 80,
      kebab: 112,
      donut: 35,
    },
    {
      country: "AL",
      "hot dog": 66,
      burger: 111,
      kebab: 167,
      donut: 18,
    },
    {
      country: "AM",
      "hot dog": 80,
      burger: 47,
      kebab: 158,
      donut: 49,
    },
  ]
};

export const mockLineData = {
  x_axis_label: 'Transportation',
  y_axis_label: 'Count',
  data: [
    {
      "id": "japan",
      "data": [
        {
          "x": "plane",
          "y": 94
        },
        {
          "x": "helicopter",
          "y": 171
        },
        {
          "x": "boat",
          "y": 25
        },
        {
          "x": "train",
          "y": 52
        },
        {
          "x": "subway",
          "y": 258
        },
        {
          "x": "bus",
          "y": 103
        },
        {
          "x": "car",
          "y": 274
        },
        {
          "x": "moto",
          "y": 237
        },
        {
          "x": "bicycle",
          "y": 294
        },
        {
          "x": "horse",
          "y": 150
        },
        {
          "x": "skateboard",
          "y": 232
        },
        {
          "x": "others",
          "y": 19
        }
      ]
    },
    {
      "id": "france",
      "data": [
        {
          "x": "plane",
          "y": 177
        },
        {
          "x": "helicopter",
          "y": 204
        },
        {
          "x": "boat",
          "y": 34
        },
        {
          "x": "train",
          "y": 143
        },
        {
          "x": "subway",
          "y": 295
        },
        {
          "x": "bus",
          "y": 286
        },
        {
          "x": "car",
          "y": 80
        },
        {
          "x": "moto",
          "y": 74
        },
        {
          "x": "bicycle",
          "y": 227
        },
        {
          "x": "horse",
          "y": 148
        },
        {
          "x": "skateboard",
          "y": 67
        },
        {
          "x": "others",
          "y": 102
        }
      ]
    },
    {
      "id": "us",
      "data": [
        {
          "x": "plane",
          "y": 254
        },
        {
          "x": "helicopter",
          "y": 264
        },
        {
          "x": "boat",
          "y": 282
        },
        {
          "x": "train",
          "y": 149
        },
        {
          "x": "subway",
          "y": 212
        },
        {
          "x": "bus",
          "y": 78
        },
        {
          "x": "car",
          "y": 105
        },
        {
          "x": "moto",
          "y": 112
        },
        {
          "x": "bicycle",
          "y": 243
        },
        {
          "x": "horse",
          "y": 54
        },
        {
          "x": "skateboard",
          "y": 273
        },
        {
          "x": "others",
          "y": 252
        }
      ]
    },
    {
      "id": "germany",
      "data": [
        {
          "x": "plane",
          "y": 77
        },
        {
          "x": "helicopter",
          "y": 251
        },
        {
          "x": "boat",
          "y": 205
        },
        {
          "x": "train",
          "y": 35
        },
        {
          "x": "subway",
          "y": 1
        },
        {
          "x": "bus",
          "y": 271
        },
        {
          "x": "car",
          "y": 298
        },
        {
          "x": "moto",
          "y": 295
        },
        {
          "x": "bicycle",
          "y": 161
        },
        {
          "x": "horse",
          "y": 60
        },
        {
          "x": "skateboard",
          "y": 229
        },
        {
          "x": "others",
          "y": 180
        }
      ]
    },
    {
      "id": "norway",
      "data": [
        {
          "x": "plane",
          "y": 286
        },
        {
          "x": "helicopter",
          "y": 227
        },
        {
          "x": "boat",
          "y": 56
        },
        {
          "x": "train",
          "y": 14
        },
        {
          "x": "subway",
          "y": 157
        },
        {
          "x": "bus",
          "y": 27
        },
        {
          "x": "car",
          "y": 124
        },
        {
          "x": "moto",
          "y": 262
        },
        {
          "x": "bicycle",
          "y": 217
        },
        {
          "x": "horse",
          "y": 220
        },
        {
          "x": "skateboard",
          "y": 130
        },
        {
          "x": "others",
          "y": 164
        }
      ]
    }
  ]
}
