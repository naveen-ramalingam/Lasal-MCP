//<NewSigmatekCFileOptimize/>
// +----------------------------------------------------------------------------------------------+
// +-[   copyright ] Sigmatek GmbH & CoKG                                                         |
// +-[      author ] kolott                                                                       |
// +-[        date ] 24.02.2020                                                                   |
// +-[ description ]------------------------------------------------------------------------------+
// |                                                                                              |
// |                                                                                              |
// +----------------------------------------------------------------------------------------------+

#include "T_IPC.H"

#ifdef UC_JAPANINPUT

#include "T_NUC.H"

#define KATAGANA_N 0x30F3

_UDWORD Japan_ValidDoppelKonsonant(_CHAR chr);

_UDWORD Japan_Katagana11(_CHAR *pd, _CHAR *ps)
{
  // 1 zeichen durch 1 anderes ersetzen
  switch(ps[0])
  {
    case 'a': pd[0] = 0x30A2; return 0x30A2;
    case 'i': pd[0] = 0x30A4; return 0x30A4;
    case 'u': pd[0] = 0x30A6; return 0x30A6;
    case 'e': pd[0] = 0x30A8; return 0x30A8;
    case 'o': pd[0] = 0x30AA; return 0x30AA;
    case 'n': pd[0] = KATAGANA_N; return KATAGANA_N;
  }
  
  return 0;
}

_UDWORD Japan_Katagana21(_CHAR *pd, _CHAR *ps)
{
  // 2 zeichen durch 1 anderes ersetzen
  switch(ps[0])
  {
    case 'k':
      switch(ps[1])
      {
        case 'a': pd[0] = 0x30AB; return 0x30AB;
        case 'i': pd[0] = 0x30AD; return 0x30AD;
        case 'u': pd[0] = 0x30AF; return 0x30AF;
        case 'e': pd[0] = 0x30B1; return 0x30B1;
        case 'o': pd[0] = 0x30B3; return 0x30B3;
      }
      break;
    case 's':
      switch(ps[1])
      {
        case 'a': pd[0] = 0x30B5; return 0x30B5;
        case 'i': pd[0] = 0x30B7; return 0x30B7;
        case 'u': pd[0] = 0x30B9; return 0x30B9;
        case 'e': pd[0] = 0x30BB; return 0x30BB;
        case 'o': pd[0] = 0x30BD; return 0x30BD;
      }
      break;
    case 't':
      switch(ps[1])
      {
        case 'a': pd[0] = 0x30BF; return 0x30BF;
        case 'i': pd[0] = 0x30C1; return 0x30C1;
        case 'u': pd[0] = 0x30C4; return 0x30C4;
        case 'e': pd[0] = 0x30C6; return 0x30C6;
        case 'o': pd[0] = 0x30C8; return 0x30C8;
      }
      break;
    case KATAGANA_N:
    case 'n':
      switch(ps[1])
      {
        case 'a': pd[0] = 0x30CA; return 0x30CA;
        case 'i': pd[0] = 0x30CB; return 0x30CB;
        case 'u': pd[0] = 0x30CC; return 0x30CC;
        case 'e': pd[0] = 0x30CD; return 0x30CD;
        case 'o': pd[0] = 0x30CE; return 0x30CE;
      }
      break;
    case 'h':
      switch(ps[1])
      {
        case 'a': pd[0] = 0x30CF; return 0x30CF;
        case 'i': pd[0] = 0x30D2; return 0x30D2;
//        case 'u': pd[0] = 0x30D5; return 0x30D5;
        case 'e': pd[0] = 0x30D8; return 0x30D8;
        case 'o': pd[0] = 0x30DB; return 0x30DB;
      }
      break;
    case 'f':
      switch(ps[1])
      {
        case 'u': pd[0] = 0x30D5; return 0x30D5;
      }
      break;
    case 'm':
      switch(ps[1])
      {
        case 'a': pd[0] = 0x30DE; return 0x30DE;
        case 'i': pd[0] = 0x30DF; return 0x30DF;
        case 'u': pd[0] = 0x30E0; return 0x30E0;
        case 'e': pd[0] = 0x30E1; return 0x30E1;
        case 'o': pd[0] = 0x30E2; return 0x30E2;
      }
      break;
    case 'y':
      switch(ps[1])
      {
        case 'a': pd[0] = 0x30E4; return 0x30E4;
        case 'u': pd[0] = 0x30E6; return 0x30E6;
        case 'o': pd[0] = 0x30E8; return 0x30E8;
      }
      break;
    case 'r':
      switch(ps[1])
      {
        case 'a': pd[0] = 0x30E9; return 0x30E9;
        case 'i': pd[0] = 0x30EA; return 0x30EA;
        case 'u': pd[0] = 0x30EB; return 0x30EB;
        case 'e': pd[0] = 0x30EC; return 0x30EC;
        case 'o': pd[0] = 0x30ED; return 0x30ED;
      }
      break;
    case 'w':
      switch(ps[1])
      {
        case 'a': pd[0] = 0x30EF; return 0x30EF;
        case 'o': pd[0] = 0x30F2; return 0x30F2;
      }
      break;
    case 'g':
      switch(ps[1])
      {
        case 'a': pd[0] = 0x30AC; return 0x30AC;
        case 'i': pd[0] = 0x30AE; return 0x30AE;
        case 'u': pd[0] = 0x30B0; return 0x30B0;
        case 'e': pd[0] = 0x30B2; return 0x30B2;
        case 'o': pd[0] = 0x30B4; return 0x30B4;
      }
      break;
    case 'z':
      switch(ps[1])
      {
        case 'a': pd[0] = 0x30B6; return 0x30B6;
        case 'i': pd[0] = 0x30B8; return 0x30B8;
        case 'u': pd[0] = 0x30BA; return 0x30BA;
        case 'e': pd[0] = 0x30BC; return 0x30BC;
        case 'o': pd[0] = 0x30BE; return 0x30BE;
      }
      break;
    case 'j':
      switch(ps[1])
      {
        case 'i': pd[0] = 0x30B8; return 0x30B8;
      }
      break;
    case 'd':
      switch(ps[1])
      {
        case 'a': pd[0] = 0x30C0; return 0x30C0;
        case 'i': pd[0] = 0x30C2; return 0x30C2;
        case 'u': pd[0] = 0x30C5; return 0x30C5;
        case 'e': pd[0] = 0x30C6; return 0x30C6;
        case 'o': pd[0] = 0x30C9; return 0x30C9;
      }
      break;
    case 'b':
      switch(ps[1])
      {
        case 'a': pd[0] = 0x30D0; return 0x30D0;
        case 'i': pd[0] = 0x30D3; return 0x30D3;
        case 'u': pd[0] = 0x30D6; return 0x30D6;
        case 'e': pd[0] = 0x30D9; return 0x30D9;
        case 'o': pd[0] = 0x30DC; return 0x30DC;
      }
      break;
    case 'p':
      switch(ps[1])
      {
        case 'a': pd[0] = 0x30D1; return 0x30D1;
        case 'i': pd[0] = 0x30D4; return 0x30D4;
        case 'u': pd[0] = 0x30D7; return 0x30D7;
        case 'e': pd[0] = 0x30DA; return 0x30DA;
        case 'o': pd[0] = 0x30DD; return 0x30DD;
      }
      break;
  }
  
  return 0;
}

_UDWORD Japan_Katagana31(_CHAR *pd, _CHAR *ps)
{
  // 3 zeichen durch 1 anderes ersetzen

  if((ps[0] == 's') && (ps[1] == 'h') && (ps[2] == 'i'))
  {
    pd[0] = 0x30B7;
    return 0x30B7;
  }

  if((ps[0] == 'c') && (ps[1] == 'h') && (ps[2] == 'i'))
  {
    pd[0] = 0x30C1;
    return 0x30C1;
  }

  if((ps[0] == 't') && (ps[1] == 's') && (ps[2] == 'u'))
  {
    pd[0] = 0x30C4;
    return 0x30C4;
  }

  return 0;
}

_UDWORD Japan_Katagana32(_CHAR *pd, _CHAR *ps)
{
  // 3 zeichen durch 2 andere ersetzen
  
  if((ps[0] == 'k') && (ps[1] == 'y'))
  {
    switch(ps[2])
    {
      case 'a': pd[0] = 0x30AD; pd[1] = 0x30E3; return 0x30E3;
      case 'u': pd[0] = 0x30AD; pd[1] = 0x30E5; return 0x30E5;
      case 'o': pd[0] = 0x30AD; pd[1] = 0x30E7; return 0x30E7;
    }
  }
  else if((ps[0] == 's') && (ps[1] == 'h'))
  {
    switch(ps[2])
    {
      case 'a': pd[0] = 0x30B7; pd[1] = 0x30E3; return 0x30E3;
      case 'u': pd[0] = 0x30B7; pd[1] = 0x30E5; return 0x30E5;
      case 'o': pd[0] = 0x30B7; pd[1] = 0x30E7; return 0x30E7;
      case 'e': pd[0] = 0x30B7; pd[1] = 0x30A7; return 0x30A7;
    }
  }
  else if((ps[0] == 'c') && (ps[1] == 'h'))
  {
    switch(ps[2])
    {
      case 'a': pd[0] = 0x30C1; pd[1] = 0x30E3; return 0x30E3;
      case 'u': pd[0] = 0x30C1; pd[1] = 0x30E5; return 0x30E5;
      case 'o': pd[0] = 0x30C1; pd[1] = 0x30E7; return 0x30E7;
      case 'e': pd[0] = 0x30C1; pd[1] = 0x30A7; return 0x30A7;
    }
  }
  else if(((ps[0] == 'n')||(ps[0] == KATAGANA_N)) && (ps[1] == 'y'))
  {
    switch(ps[2])
    {
      case 'a': pd[0] = 0x30CB; pd[1] = 0x30E3; return 0x30E3;
      case 'u': pd[0] = 0x30CB; pd[1] = 0x30E5; return 0x30E5;
      case 'o': pd[0] = 0x30CB; pd[1] = 0x30E7; return 0x30E7;
    }
  }
  else if((ps[0] == 'h') && (ps[1] == 'y'))
  {
    switch(ps[2])
    {
      case 'a': pd[0] = 0x30D2; pd[1] = 0x30E3; return 0x30E3;
      case 'u': pd[0] = 0x30D2; pd[1] = 0x30E5; return 0x30E5;
      case 'o': pd[0] = 0x30D2; pd[1] = 0x30E7; return 0x30E7;
    }
  }
  else if((ps[0] == 'm') && (ps[1] == 'y'))
  {
    switch(ps[2])
    {
      case 'a': pd[0] = 0x30DF; pd[1] = 0x30E3; return 0x30E3;
      case 'u': pd[0] = 0x30DF; pd[1] = 0x30E5; return 0x30E5;
      case 'o': pd[0] = 0x30DF; pd[1] = 0x30E7; return 0x30E7;
    }
  }
  else if((ps[0] == 'r') && (ps[1] == 'y'))
  {
    switch(ps[2])
    {
      case 'a': pd[0] = 0x30EA; pd[1] = 0x30E3; return 0x30E3;
      case 'u': pd[0] = 0x30EA; pd[1] = 0x30E5; return 0x30E5;
      case 'o': pd[0] = 0x30EA; pd[1] = 0x30E7; return 0x30E7;
    }
  }
  else if((ps[0] == 'g') && (ps[1] == 'y'))
  {
    switch(ps[2])
    {
      case 'a': pd[0] = 0x30AE; pd[1] = 0x30E3; return 0x30E3;
      case 'u': pd[0] = 0x30AE; pd[1] = 0x30E5; return 0x30E5;
      case 'o': pd[0] = 0x30AE; pd[1] = 0x30E7; return 0x30E7;
    }
  }
  else if((ps[0] == 'b') && (ps[1] == 'y'))
  {
    switch(ps[2])
    {
      case 'a': pd[0] = 0x30D3; pd[1] = 0x30E3; return 0x30E3;
      case 'u': pd[0] = 0x30D3; pd[1] = 0x30E5; return 0x30E5;
      case 'o': pd[0] = 0x30D3; pd[1] = 0x30E7; return 0x30E7;
    }
  }
  else if((ps[0] == 'p') && (ps[1] == 'y'))
  {
    switch(ps[2])
    {
      case 'a': pd[0] = 0x30D4; pd[1] = 0x30E3; return 0x30E3;
      case 'u': pd[0] = 0x30D4; pd[1] = 0x30E5; return 0x30E5;
      case 'o': pd[0] = 0x30D4; pd[1] = 0x30E7; return 0x30E7;
    }
  }
  else if((ps[0] == 'f') && (ps[1] == 'y'))
  {
    switch(ps[2])
    {
      case 'u': pd[0] = 0x30D5; pd[1] = 0x30E5; return 0x30E5;
    }
  }
  else if((ps[0] == 't') && (ps[1] == 's'))
  {
    switch(ps[2])
    {
      case 'a': pd[0] = 0x30C4; pd[1] = 0x30A1; return 0x30A1;
      case 'i': pd[0] = 0x30C4; pd[1] = 0x30A3; return 0x30A3;
      case 'e': pd[0] = 0x30C4; pd[1] = 0x30A7; return 0x30A7;
      case 'o': pd[0] = 0x30C4; pd[1] = 0x30A9; return 0x30A9;
    }
  }
  else if((ps[0] == 'w') && (ps[1] == 'h'))
  {
    switch(ps[2])
    {
      case 'o': pd[0] = 0x30A6; pd[1] = 0x30A9; return 0x30A9;
    }
  }
  
  return 0;
}

_UDWORD Japan_Katagana22(_CHAR *pd, _CHAR *ps)
{
  // 2 zeichen durch 2 andere ersetzen
  switch(ps[0])
  {
    case 'j':
      switch(ps[1])
      {
        case 'a': pd[0] = 0x30B8; pd[1] = 0x30E3; return 0x30E3;
        case 'u': pd[0] = 0x30B8; pd[1] = 0x30E5; return 0x30E5;
        case 'o': pd[0] = 0x30B8; pd[1] = 0x30E7; return 0x30E7;
        case 'e': pd[0] = 0x30B8; pd[1] = 0x30A7; return 0x30A7;
      }
      break;
    case 'f':
      switch(ps[1])
      {
        case 'a': pd[0] = 0x30D5; pd[1] = 0x30A1; return 0x30A1;
        case 'i': pd[0] = 0x30D5; pd[1] = 0x30A3; return 0x30A3;
        case 'e': pd[0] = 0x30D5; pd[1] = 0x30A7; return 0x30A7;
        case 'o': pd[0] = 0x30D5; pd[1] = 0x30A9; return 0x30A9;
      }
      break;
    case 'w':
      switch(ps[1])
      {
        case 'i': pd[0] = 0x30A6; pd[1] = 0x30A3; return 0x30A3;
        case 'e': pd[0] = 0x30A6; pd[1] = 0x30A7; return 0x30A7;
      }
      break;
    case 'v':
      switch(ps[1])
      {
        case 'a': pd[0] = 0x30A6; pd[1] = 0x30A1; return 0x30A1;
        case 'i': pd[0] = 0x30A6; pd[1] = 0x30A3; return 0x30A3;
        case 'e': pd[0] = 0x30A6; pd[1] = 0x30A7; return 0x30A7;
        case 'o': pd[0] = 0x30A6; pd[1] = 0x30A9; return 0x30A9;
      }
      break;
  }
  
  if(ps[0] == ps[1])
  {
    if(Japan_ValidDoppelKonsonant(ps[0]) != 0) // nur bei JAPAN_ADVANCED
    {
      pd[0] = 12483;
      return ps[0];
    }
  }
  
  return 0;
}

#endif // UC_JAPANINPUT
